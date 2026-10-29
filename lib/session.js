/** Server-only session management utilities. */
import bcrypt from 'bcryptjs';

const TOKEN_BYTES = 32;
const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || '12', 10) || 12;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const COOKIE_NAME = 'resolx_session';

export function generateSessionToken() {
  const buf = new Uint8Array(TOKEN_BYTES);
  globalThis.crypto.getRandomValues(buf);
  const rawToken = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
  const tokenHash = bcrypt.hashSync(rawToken, 10);
  return { rawToken, tokenHash };
}

export async function hashSessionToken(rawToken) {
  return bcrypt.hash(rawToken, 10);
}

export async function verifySessionToken(rawToken, tokenHash) {
  return bcrypt.compare(rawToken, tokenHash);
}

export function buildSessionExpiry() {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + SESSION_TTL_HOURS);
  return expiry;
}

export function buildSessionCookie(token, expires, clear = false) {
  const cookieParts = [];
  if (clear) {
    cookieParts.push(`${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  } else {
    cookieParts.push(`${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax`);
    if (IS_PRODUCTION) {
      cookieParts.push('Secure');
    }
    cookieParts.push(`Expires=${expires.toUTCString()}`);
  }
  return cookieParts.join('; ');
}

export { COOKIE_NAME, IS_PRODUCTION };