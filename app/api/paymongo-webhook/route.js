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
  const meta = (session.attributes && session.attributes.metadata) || {};
  const db = createClient(url, service, { auth: { persistSession: false } });

  let q = db.from('orders').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('status', 'pending');
  q = session.id ? q.eq('paymongo_session_id', session.id) : q.eq('id', meta.order_id);
  const { error } = await q;
  if (error) return new Response('db error', { status: 500 }); // PayMongo retries on non-2xx
  return new Response('ok', { status: 200 });
}
