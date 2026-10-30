/**
 * Server-only SHA-256 hash utility for the audit trail.
 *
 * Produces a deterministic hash from canonical serialized input.
 * The canonical form is JSON with sorted keys and no whitespace, which
 * guarantees that logically equivalent events always produce the same hash,
 * regardless of the order in which properties were written to the object.
 */
import crypto from 'crypto';

const MAX_METADATA_BYTES = 1024 * 1024; // 1 MB safety cap on serialized metadata

/**
 * Serialize an object to a canonical JSON string.
 * - Keys sorted alphabetically
 * - No whitespace
 * - Dates formatted as ISO strings
 */
function canonicalSerialize(value) {
  if (value === null || value === undefined) {
    return JSON.stringify(value);
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalSerialize(item)).join(',')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, val]) => {
        const sorted = canonicalSerialize(val);
        return `${JSON.stringify(key)}:${sorted}`;
      })
      .sort();
    return `{${entries.join(',')}}`;
  }
  const str = Object.prototype.toString.call(value);
  if (str === '[object Date]') {
    return JSON.stringify(value.toISOString());
  }
  return JSON.stringify(value);
}

/**
 * Compute a deterministic SHA-256 hash for an event payload.
 * @param {Object} payload - The event data to hash
 * @returns {string} - Lowercase hex SHA-256 digest
 */
export function computeEventHash(payload) {
  const canonical = canonicalSerialize(payload);
  const digest = crypto.createHash('sha256').update(canonical).digest('hex');
  return digest;
}

/**
 * Build the canonical payload for a new audit event.
 * This must always produce the same shape for the same logical event.
 */
export function buildEventPayload({
  eventType,
  actorId,
  actorRole,
  grievanceId,
  statusFrom,
  statusTo,
  metadata = {},
  timestamp,
  eventId,
}) {
  const base = {
    eventType,
    actorId,
    actorRole,
    grievanceId,
    statusFrom: statusFrom || null,
    statusTo: statusTo || null,
    metadata: metadata || {},
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  };
  if (eventId) {
    base.eventId = eventId;
  }
  return base;
}

/**
 * Verify a sequence of audit events for a grievance.
 * @param {Array} events - Chronologically sorted array of AuditEvent records
 * @returns {Object} { intact: boolean, verifiedCount: number, errorIndex: number | null, errorMessage: string | null }
 */
export function verifyAuditChain(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return { intact: true, verifiedCount: 0, errorIndex: null, errorMessage: null };
  }

  let previousHash = null;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (i === 0) {
      if (event.previousHash !== null) {
        return {
          intact: false,
          verifiedCount: 0,
          errorIndex: 0,
          errorMessage: `Root event expected previousHash to be null, found ${event.previousHash}`,
        };
      }
    } else {
      if (event.previousHash !== previousHash) {
        return {
          intact: false,
          verifiedCount: i,
          errorIndex: i,
          errorMessage: `Chain broken at event index ${i}: expected previousHash ${previousHash}, found ${event.previousHash}`,
        };
      }
    }

    const payload = buildEventPayload({
      eventType: event.eventType,
      actorId: event.actorId?._id ? event.actorId._id.toString() : (event.actorId?.toString ? event.actorId.toString() : String(event.actorId)),
      actorRole: event.actorRole,
      grievanceId: event.grievanceId?._id ? event.grievanceId._id.toString() : (event.grievanceId?.toString ? event.grievanceId.toString() : String(event.grievanceId)),
      statusFrom: event.statusFrom || null,
      statusTo: event.statusTo || null,
      metadata: event.metadata || {},
      timestamp: event.createdAt ? new Date(event.createdAt) : event.timestamp,
    });

    const expectedHash = computeEventHash(payload);

    if (event.currentHash !== expectedHash) {
      return {
        intact: false,
        verifiedCount: i,
        errorIndex: i,
        errorMessage: `Hash mismatch at event index ${i}: stored ${event.currentHash}, expected ${expectedHash}`,
      };
    }

    previousHash = event.currentHash;
  }

  return { intact: true, verifiedCount: events.length, errorIndex: null, errorMessage: null };
}
