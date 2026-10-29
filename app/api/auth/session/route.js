import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const result = await getSessionUser(req);

  if (result.error) {
    return new Response(
      JSON.stringify({ authenticated: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      user: result.user,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}