/**
 * In-memory sliding-window rate limiter for authentication endpoints.
 *
 * Suitable for single-instance deployment. For multi-instance deployments,
 * replace this with a Redis-backed limiter keyed by the same identifier.
 *
 * Stores { identifier: { count, windowStart } } in a Map.
 * Entries are never explicitly pruned; they are overwritten when the window
 * rotates, which is acceptable for low-traffic auth endpoints.
 */
const windows = new Map();

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check and increment the rate-limit counter for an identifier.
 * @param {string} identifier - unique key (e.g. "ip:route")
 * @param {Object} options - { maxAttempts, windowMs }
 * @returns {Object} { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(identifier, options = {}) {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();

  const entry = windows.get(identifier);

  if (!entry || now - entry.windowStart >= windowMs) {
    // Start a new window
    windows.set(identifier, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt: now + windowMs,
    };
  }

  // Within existing window
  entry.count += 1;
  const remaining = Math.max(0, maxAttempts - entry.count);
  const allowed = entry.count <= maxAttempts;

  return {
    allowed,
      remaining,
    resetAt: entry.windowStart + windowMs,
  };
}

/**
 * Reset the rate-limit window for an identifier (e.g. after successful login).
 */
export function resetRateLimit(identifier) {
  windows.delete(identifier);
}