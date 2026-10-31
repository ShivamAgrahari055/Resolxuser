import { connect } from '@/lib/db';
import User from '@/models/User';
import Session from '@/models/Session';
import { generateSessionToken, buildSessionExpiry, buildSessionCookie, COOKIE_NAME } from '@/lib/session';
import { checkRateLimit } from '@/lib/rateLimit';
import { GENERIC_AUTH_ERROR } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const PASSWORD_MIN_LENGTH = 8;

export async function POST(req) {
  const identifier = `ip:${req.headers.get('x-forwarded-for') || 'unknown'}:login`;
  const limit = checkRateLimit(identifier, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });

  if (!limit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many attempts. Try again later.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  let db;
  try {
    db = await connect();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Service unavailable' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { email, password } = body;

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: GENERIC_AUTH_ERROR }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return new Response(
      JSON.stringify({ error: GENERIC_AUTH_ERROR }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    return new Response(
      JSON.stringify({ error: GENERIC_AUTH_ERROR }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const user = await db.model('User').findOne({ email: normalizedEmail });

    let passwordValid = false;
    if (user) {
      passwordValid = await bcrypt.compare(password, user.passwordHash);
    }

    if (!user || !passwordValid) {
      return new Response(
        JSON.stringify({ error: GENERIC_AUTH_ERROR }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { rawToken, tokenHash } = generateSessionToken();
    const expiresAt = buildSessionExpiry();

    await db.model('Session').create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    const cookie = buildSessionCookie(rawToken, expiresAt);

    return new Response(
      JSON.stringify({
        message: 'Signed in successfully',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookie,
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: GENERIC_AUTH_ERROR }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}