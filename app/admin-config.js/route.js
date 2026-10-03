export const dynamic = 'force-static';

// Serves /admin-config.js so public/admin.html can use the same Supabase settings as the site (from .env.local).
export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const body = `window.FUNDYS_SUPABASE = ${JSON.stringify({ url, key })};\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } });
}
