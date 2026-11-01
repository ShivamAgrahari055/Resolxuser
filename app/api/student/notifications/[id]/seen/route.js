import { NextResponse } from 'next/server';
import { connect } from '@/lib/db.js';
import { getSessionUser } from '@/lib/auth.js';
import Notification from '@/models/Notification.js';

export async function POST(req, { params }) {
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

  await connect();

  const notificationId = params.id;
  if (!notificationId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const ids = body.ids;
  const idsToMark = Array.isArray(ids) ? ids : [ids];

  if (idsToMark.length === 0) {
    return NextResponse.json({ items: 0, marked: 0 });
  }

  // Build a filter for notifications that exist AND belong to the current user.
  const filter = {
    _id: { $in: idsToMark },
    userId: user.id,
  };

  const result = await Notification.updateMany(
    filter,
    { $set: { read: true } }
  );

  return NextResponse.json({
    items: idsToMark.length,
    marked: result.modifiedCount,
  });
}