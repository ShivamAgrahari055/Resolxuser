import { connect } from '@/lib/db';
import { COOKIE_NAME } from '@/lib/session';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let db;
  try {
    db = await connect();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Service unavailable' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => c.trim().split('=')).filter((p) => p.length === 2)
  );
  const rawToken = cookies[COOKIE_NAME];

  if (rawToken) {
    try {
      const sessions = await db.model('Session').find({}).lean();
      for (const session of sessions) {
        const valid = await bcrypt.compare(rawToken, session.tokenHash);
        if (valid) {
          await db.model('Session').deleteOne({ _id: session._id });
          break;
        }
      }
    } catch {
      // Best-effort deletion; proceed to clear cookie regardless
    }
  }

  const clearCookie = `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  return new Response(
    JSON.stringify({ message: 'Signed out successfully' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearCookie,
      },
    }
  );
}
