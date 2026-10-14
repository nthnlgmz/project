// Small helpers shared by the API routes.
import { createHash } from 'crypto';
export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

// Blocks cross-site form posts (CSRF). Browsers always send Origin on a POST, so it must match this site.
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // not a browser form post (e.g. server-to-server); the other checks still apply
  try { return new URL(origin).host === request.headers.get('host'); } catch { return false; }
}

// A hashed, non-reversible fingerprint of the visitor's IP. Only used to stop one visitor reserving many voucher uses.
export function ipHash(request) {
  const ip = String(request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  if (!ip) return null;
  return createHash('sha256').update(ip + '|' + (process.env.SUPABASE_SERVICE_ROLE_KEY || '')).digest('hex').slice(0, 32);
}
