// PayMongo calls this when a payment succeeds. Create the webhook in the PayMongo dashboard:
//   URL: https://YOUR-DOMAIN/api/paymongo-webhook   Event: checkout_session.payment.paid
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function validSignature(header, raw, secret, live) {
  const parts = Object.fromEntries((header || '').split(',').map((p) => p.split('=')).filter((p) => p.length === 2));
  const sig = live ? parts.li : parts.te;
  if (!parts.t || !sig) return false;
  const expected = createHmac('sha256', secret).update(parts.t + '.' + raw).digest('hex');
  const a = Buffer.from(expected), b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !url || !service) return new Response('not configured', { status: 503 });

  const raw = await request.text();
  let event;
  try { event = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }
  const attrs = event && event.data && event.data.attributes;
  if (!attrs) return new Response('bad event', { status: 400 });

  if (!validSignature(request.headers.get('paymongo-signature'), raw, secret, !!attrs.livemode)) {
    return new Response('invalid signature', { status: 401 });
  }
  if (attrs.type !== 'checkout_session.payment.paid') return new Response('ignored', { status: 200 });

  const session = attrs.data || {};
  const sAttrs = session.attributes || {};
  const meta = sAttrs.metadata || {};
  const db = createClient(url, service, { auth: { persistSession: false } });

  // Which method paid (gcash, paymaya, card, grab_pay...). Read it from the event; fall back to the payment source,
  // then to asking PayMongo for the session, so it is recorded even if the event is missing the field.
  let method = typeof sAttrs.payment_method_used === 'string' ? sAttrs.payment_method_used : null;
  const sourceType = (p) => (p && p.attributes && p.attributes.source && p.attributes.source.type) || null;
  if (!method) method = sourceType((sAttrs.payments || [])[0]);
  if (!method && session.id && process.env.PAYMONGO_SECRET_KEY) {
    try {
      const res = await fetch('https://api.paymongo.com/v1/checkout_sessions/' + encodeURIComponent(session.id), {
        headers: { Authorization: 'Basic ' + Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64') },
      });
      const j = await res.json();
      const a2 = (j && j.data && j.data.attributes) || {};
      method = a2.payment_method_used || sourceType((a2.payments || [])[0]) || null;
    } catch (e) { console.error('PayMongo session lookup failed', e); }
  }

  const forThisOrder = (q) => (session.id ? q.eq('paymongo_session_id', session.id) : q.eq('id', meta.order_id));

  // 1) mark the order paid (this alone must never be blocked by anything below)
  const paid = await forThisOrder(db.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('status', 'pending').select('id'));
  if (paid.error) return new Response('db error', { status: 500 }); // PayMongo retries on non-2xx

  // A paid order always counts toward its voucher, even if the hold was released while the customer was still paying.
  for (const row of paid.data || []) {
    const r = await db.rpc('reclaim_order_voucher', { p_order_id: row.id });
    if (r.error && !/reclaim_order_voucher/.test(r.error.message)) console.error('voucher reclaim failed', r.error.message);
  }

  // 2) record how they paid. Runs on every delivery, so tapping Retry in PayMongo also fills it for older orders.
  if (method) {
    const saved = await forThisOrder(db.from('orders').update({ payment_method: String(method).slice(0, 30) }).is('payment_method', null));
    if (saved.error) console.error('Could not save payment_method (has supabase/add-payment-method.sql been run?)', saved.error.message);
  }
  return new Response('ok', { status: 200 });
}
