import { connect } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const appStatus = 'running';

  let dbStatus = 'disconnected';

  try {
    await connect();
    dbStatus = 'connected';
  } catch {
    // Sanitized: do not expose underlying error details
    dbStatus = 'disconnected';
  }

  const healthy = dbStatus === 'connected';

  return new Response(
    JSON.stringify({
      status: healthy ? 'healthy' : 'unhealthy',
      app: appStatus,
      database: dbStatus,
    }),
    {
      status: healthy ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}