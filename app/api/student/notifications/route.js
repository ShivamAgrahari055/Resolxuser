import { NextResponse } from 'next/server';
import { connect } from '@/lib/db.js';
import { getSessionUser } from '@/lib/auth.js';
import Notification from '@/models/Notification.js';

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

  const [notifications, total] = await Promise.all([
    Notification.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId: user.id }),
  ]);

  // Mark unread notifications as read for the current user only.
  if (notifications.some((n) => !n.read)) {
    await Notification.updateMany(
      { userId: user.id, read: false },
      { $set: { read: true } }
    );
  }

  return NextResponse.json({
    items: notifications,
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