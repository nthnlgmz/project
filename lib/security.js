
// Small helpers shared by the API routes.
export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Blocks cross-site form posts (CSRF). Browsers always send Origin on a POST, so it must match this site.
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // not a browser form post (e.g. server-to-server); the other checks still apply
  try { return new URL(origin).host === request.headers.get('host'); } catch { return false; }
}
