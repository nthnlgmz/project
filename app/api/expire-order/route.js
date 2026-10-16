// Called when a customer comes back from PayMongo with "cancelled": expires that order's payment page
// (voucher orders only) so the old link can't be paid later, and gives the voucher use back.
import { createClient } from '@supabase/supabase-js';
import { json, sameOrigin } from '../../../lib/security';
import { expireOrder } from '../../../lib/expire-orders';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const pmKey = process.env.PAYMONGO_SECRET_KEY;
    if (!url || !service || !pmKey) return json({ ok: false }, 503);
    if (!sameOrigin(request)) return json({ ok: false }, 403);
    let body;
    try { body = JSON.parse(await request.text()); } catch { return json({ ok: false }, 400); }
    const orderNo = String((body && body.orderNo) || '').toUpperCase();
    if (!/^FND-[0-9A-F]{6}$/.test(orderNo)) return json({ ok: false }, 400);
    const db = createClient(url, service, { auth: { persistSession: false } });
    const { data: order } = await db.from('orders').select('id, paymongo_session_id')
      .eq('order_no', orderNo).eq('status', 'pending').not('voucher_id', 'is', null).maybeSingle();
    if (!order) return json({ ok: true, expired: false });
    return json({ ok: true, expired: await expireOrder(db, pmKey, order) });
  } catch (e) {
    console.error('expire-order crashed:', e && e.stack ? e.stack : e);
    return json({ ok: false }, 500);
  }
}
