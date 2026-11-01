import { NextResponse } from 'next/server';
import { connect } from '@/lib/db.js';
import { getSessionUser } from '@/lib/auth.js';
import { verifySessionToken } from '@/lib/session.js';
import Grievance from '@/models/Grievance.js';

export async function GET(req, { params }) {
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

  const grievanceId = params.id;
  if (!grievanceId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
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

  await connect();

  // Fetch only the student's own grievance.
  const grievance = await Grievance.findOne({ _id: grievanceId, studentId: user.id }).lean();
  if (!grievance) {
    // Generic 404: do not reveal whether the record exists.
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
}