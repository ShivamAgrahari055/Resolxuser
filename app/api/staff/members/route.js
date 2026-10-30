import { NextResponse } from 'next/server';
import { connect } from '@/lib/db.js';
import { getSessionUser } from '@/lib/auth.js';
import User from '@/models/User.js';

export async function GET(req) {
  try {
    const sessionResult = await getSessionUser(req);
    if (sessionResult.error) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: sessionResult.status }
      );
    }
    const user = sessionResult.user;
    if (user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connect();

    const staffMembers = await User.find({ role: 'STAFF' })
      .select('_id name email')
      .sort({ name: 1 })
      .lean();

    const formatted = staffMembers.map((m) => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
    }));

    return NextResponse.json({ members: formatted });
  } catch {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
