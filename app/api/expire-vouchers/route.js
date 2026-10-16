// Scheduled sweep (see vercel.json): expires unpaid voucher orders past the hold time.
// Set CRON_SECRET in Vercel; Vercel Cron sends it as "Authorization: Bearer <secret>".
import { createClient } from '@supabase/supabase-js';
import { json } from '../../../lib/security';
import { sweepVoucherOrders } from '../../../lib/expire-orders';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== 'Bearer ' + secret) return json({ ok: false }, 401);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pmKey = process.env.PAYMONGO_SECRET_KEY;
  if (!url || !service || !pmKey) return json({ ok: false }, 503);
  const db = createClient(url, service, { auth: { persistSession: false } });
  return json({ ok: true, expired: await sweepVoucherOrders(db, pmKey, 50) });
}
