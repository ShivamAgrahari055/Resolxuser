import { NextResponse } from 'next/server';
import { connect } from '@/lib/db.js';
import { getSessionUser } from '@/lib/auth.js';
import Session from '@/models/Session.js';
import Grievance from '@/models/Grievance.js';
import AuditEvent from '@/models/AuditEvent.js';
import { buildEventPayload, computeEventHash } from '@/lib/audit.js';
import { verifySessionToken } from '@/lib/session.js';

const SUPPORTED_CATEGORIES = ['hostel', 'mess', 'academics', 'facilities', 'other'];
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;

// Helper: parse and validate a grievance submission body.
function sanitizePayload(body) {
  const { title, description, category } = body;
  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  const trimmedDescription = typeof description === 'string' ? description.trim() : '';
  const normalizedCategory = typeof category === 'string' ? category.trim().toLowerCase() : '';

  if (!trimmedTitle || trimmedTitle.length > MAX_TITLE_LENGTH) {
    return { error: `Title must be between 1 and ${MAX_TITLE_LENGTH} characters` };
  }
  if (!trimmedDescription || trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description must be between 1 and ${MAX_DESCRIPTION_LENGTH} characters` };
  }
  if (!SUPPORTED_CATEGORIES.includes(normalizedCategory)) {
    return { error: `Category must be one of: ${SUPPORTED_CATEGORIES.join(', ')}` };
  }

  return {
    title: trimmedTitle,
    description: trimmedDescription,
    category: normalizedCategory,
  };
}

export async function POST(req) {
  let user;
  try {
    const sessionResult = await getSessionUser(req);
    if (sessionResult.error) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: sessionResult.status }
      );
    }
    user = sessionResult.user;
    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const payload = sanitizePayload(body);
  if (payload.error) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  // Resolve the authenticated actor from the session record.
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => c.trim().split('=')).filter((p) => p.length === 2)
  );
  const rawToken = cookies['resolx_session'];
  if (!rawToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  let actorId;
  let actorRole = 'STUDENT';
  try {
    const sessions = await Session.find({ expiresAt: { $gt: new Date() } }).lean();
    for (const session of sessions) {
      const valid = await verifySessionToken(rawToken, session.tokenHash);
      if (valid) {
        actorId = session.userId.toString();
        break;
      }
    }
    if (!actorId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
  } catch {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const conn = await connect();
  let mongooseSession = null;
  let transactionStarted = false;
  try {
    const session = conn.startSession();
    session.startTransaction();
    mongooseSession = session;
    transactionStarted = true;
  } catch {
    // Transactions are unavailable in this deployment; the audit trail is still
    // persisted, but atomicity of the grievance + audit pair is not guaranteed.
  }

  try {
    const createOpts = mongooseSession ? { session: mongooseSession } : {};

    const [grievance] = await Grievance.create(
      [
        {
          studentId: user.id,
          title: payload.title,
          description: payload.description,
          category: payload.category,
          status: 'SUBMITTED',
        },
      ],
      createOpts
    );

    const grievanceId = grievance._id.toString();

    const eventPayload = buildEventPayload({
      eventType: 'grievance_submitted',
      actorId: actorId,
      actorRole: actorRole,
      grievanceId,
      statusFrom: null,
      statusTo: 'SUBMITTED',
      metadata: {
        createdAt: grievance.createdAt.toISOString(),
        studentId: user.id,
        category: payload.category,
        title: payload.title,
      },
      timestamp: new Date(),
    });

    const currentHash = computeEventHash(eventPayload);

    await AuditEvent.create(
      [
        {
          grievanceId,
          actorId: actorId,
          actorRole: actorRole,
          eventType: 'grievance_submitted',
          statusFrom: null,
          statusTo: 'SUBMITTED',
          metadata: {
            createdAt: grievance.createdAt.toISOString(),
            title: payload.title,
            category: payload.category,
          },
          previousHash: null,
          currentHash,
        },
      ],
      createOpts
    );

    if (transactionStarted) {
      await conn.commitTransaction();
    }

    return NextResponse.json({
      id: grievance._id.toString(),
      studentId: grievance.studentId,
      title: grievance.title,
      description: grievance.description,
      category: grievance.category,
      status: grievance.status,
      assignedTo: grievance.assignedTo,
      createdAt: grievance.createdAt,
      updatedAt: grievance.updatedAt,
      version: grievance.version,
    });
  } catch (error) {
    try {
      if (transactionStarted) {
        await conn.abortTransaction();
      }
    } catch {
      // Ignore abort errors to avoid masking the original failure.
    }
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(req) {
  let user;
  try {
    const sessionResult = await getSessionUser(req);
    if (sessionResult.error) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: sessionResult.status }
      );
    }
    user = sessionResult.user;
    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)), 100);
  const search = (url.searchParams.get('search') || '').trim();
  const statusFilter = (url.searchParams.get('status') || '').trim().toUpperCase();
  const categoryFilter = (url.searchParams.get('category') || '').trim().toLowerCase();

  await connect();

  const query = { studentId: user.id };

  if (statusFilter && SUPPORTED_CATEGORIES.includes(statusFilter)) {
    query.status = statusFilter;
  }
  if (categoryFilter && SUPPORTED_CATEGORIES.includes(categoryFilter)) {
    query.category = categoryFilter;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  const [grievances, total] = await Promise.all([
    Grievance.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Grievance.countDocuments(query),
  ]);

  return NextResponse.json({
    items: grievances,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}