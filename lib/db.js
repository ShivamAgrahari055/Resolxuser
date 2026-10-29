/**
 * Server-only Mongoose connection utility.
 * Caches the connection to avoid opening repeated connections during
 * Next.js development hot reload.
 *
 * Never logs credentials or the full connection URI.
 */
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment');
}

// Extract database name for validation without exposing credentials
let dbNameLabel = 'unknown';
try {
  const parsed = new URL(uri);
  const pathParts = parsed.pathname.split('/').filter(Boolean);
  dbNameLabel = pathParts.length > 0 ? pathParts[0] : 'unknown';
} catch {
  // Not a standard URL; could be an SRV connection string. That's fine.
}

const connectionOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, connectionOptions)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        throw new Error(`Database connection failed: ${error.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    throw error;
  }

  return cached.conn;
}

export { connect, dbNameLabel };