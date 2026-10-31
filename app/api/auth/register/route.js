import { connect } from '@/lib/db';
import User from '@/models/User';
import Session from '@/models/Session';
import { generateSessionToken, buildSessionExpiry, buildSessionCookie, COOKIE_NAME } from '@/lib/session';
import { checkRateLimit } from '@/lib/rateLimit';
import { GENERIC_AUTH_ERROR } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

export async function POST(req) {
  const identifier = `ip:${req.headers.get('x-forwarded-for') || 'unknown'}:register`;
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

  const { name, email, password } = body;

  if (!name || !email || !password) {
    return new Response(
      JSON.stringify({ error: 'Name, email, and password are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const trimmedName = String(name).trim();

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return new Response(
      JSON.stringify({ error: 'Name must be between 2 and 100 characters' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return new Response(
      JSON.stringify({ error: 'Please provide a valid email address' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return new Response(
      JSON.stringify({ error: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const existingUser = await db.model('User').findOne({ email: normalizedEmail });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'An account with this email already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.model('User').create({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      role: 'STUDENT',
    });

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
        message: 'Account created successfully',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookie,
        },
      }
    );
  } catch (error) {
    if (error.code === 11000) {
      return new Response(
        JSON.stringify({ error: 'An account with this email already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: GENERIC_AUTH_ERROR }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}