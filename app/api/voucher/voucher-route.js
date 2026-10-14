// Preview only: tells the checkout page what a voucher would take off. Nothing is claimed here;
// the atomic claim happens when the order is created (app/api/checkout/route.js).
import { createClient } from '@supabase/supabase-js';
import { json, sameOrigin } from '../../../lib/security';
import { parseCart, priceCart } from '../../../lib/cart-server';
import { CODE_RE, MIN_CHARGE_CENTS, normalizeCode, isUsable, priceLines, describeVoucher } from '../../../lib/vouchers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const INVALID = "This code isn't valid or has expired."; // one message for every failure, so codes can't be probed

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return json({ ok: false, error: 'Vouchers are not available right now.' }, 503);
  if (!sameOrigin(request)) return json({ ok: false, error: 'Request blocked.' }, 403);

  const raw = await request.text();
  if (raw.length > 10000) return json({ ok: false, error: 'Request too large.' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }

  const code = normalizeCode(body && body.code);
  if (!CODE_RE.test(code)) return json({ ok: false, error: INVALID }, 422);

  const db = createClient(url, service, { auth: { persistSession: false } });
  try { await db.rpc('expire_stale_voucher_holds'); } catch (e) { /* best effort */ }

  const priced = await priceCart(db, parseCart(body.items));
  if (priced.error) return json({ ok: false, error: priced.error }, priced.status);

  const { data: v } = await db.from('vouchers').select('*').eq('code', code).maybeSingle();
  if (!v || !isUsable(v)) return json({ ok: false, error: INVALID }, 422);

  const p = priceLines(priced.lines, v);
  if (p.totalCents < MIN_CHARGE_CENTS) return json({ ok: false, error: "This code can't be used on this order." }, 422);
  return json({ ok: true, code: v.code, label: describeVoucher(v), subtotal: p.subtotalCents / 100, discount: p.discountCents / 100, total: p.totalCents / 100 });
}
