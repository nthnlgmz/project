// Checks a Google-signed-in Supabase user against the ADMIN_EMAILS env var (comma-separated).
// If the email is listed, the user is added to the `admins` table (which the Row Level Security
// policies rely on); if not, any existing row is removed. Needs SUPABASE_SERVICE_ROLE_KEY (server only).
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) {
    return json({ ok: false, error: 'Server is missing SUPABASE_SERVICE_ROLE_KEY (or the Supabase URL/anon key).' }, 500);
  }

  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ ok: false, error: 'Not signed in.' }, 401);

  // Verify the token with Supabase, never trust an email sent by the browser.
  const authClient = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await authClient.auth.getUser(token);
  const user = data && data.user;
  if (error || !user) return json({ ok: false, error: 'Invalid session.' }, 401);

  const email = (user.email || '').trim().toLowerCase();
  const verified = !!(user.email_confirmed_at || (user.user_metadata && user.user_metadata.email_verified));
  const allowed = (process.env.ADMIN_EMAILS || '')
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const isAdmin = !!email && verified && allowed.includes(email);

  if (isAdmin) {
    const { error: upErr } = await admin.from('admins').upsert({ user_id: user.id }, { onConflict: 'user_id' });
    if (upErr) return json({ ok: false, error: 'Could not register admin: ' + upErr.message }, 500);
    return json({ ok: true, email });
  }

  await admin.from('admins').delete().eq('user_id', user.id); // revoke if removed from ADMIN_EMAILS
  return json({ ok: false, error: 'This Google account is not on the admin list.' }, 403);
}
