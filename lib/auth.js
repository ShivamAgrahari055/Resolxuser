import { connect } from './db.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { verifySessionToken, COOKIE_NAME } from './session.js';

const GENERIC_AUTH_ERROR = 'Invalid email or password';

export async function getSessionUser(req) {
  try {
    await connect();
  } catch {
    return { error: 'Service unavailable', status: 503 };
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => c.trim().split('=')).filter((p) => p.length === 2)
  );
  const rawToken = cookies[COOKIE_NAME];

  if (!rawToken) {
    return { error: 'Not authenticated', status: 401 };
  }

  try {
    const sessions = await Session.find({
      expiresAt: { $gt: new Date() },
    }).lean();

    let matchedSession = null;
    for (const session of sessions) {
      const valid = await verifySessionToken(rawToken, session.tokenHash);
      if (valid) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      return { error: 'Not authenticated', status: 401 };
    }

    const user = await User.findById(matchedSession.userId).lean();
    if (!user) {
      return { error: 'Not authenticated', status: 401 };
    }

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch {
    return { error: 'Not authenticated', status: 401 };
  }
}

export function requireAuth(handler) {
  return async (req, { params } = {}) => {
    const result = await getSessionUser(req);
    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: result.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return handler(req, { params, user: result.user });
  };
}

export function requireRole(requiredRole, handler) {
  return async (req, { params } = {}) => {
    const result = await getSessionUser(req);
    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: result.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (result.user.role !== requiredRole) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return handler(req, { params, user: result.user });
  };
}

export { GENERIC_AUTH_ERROR };