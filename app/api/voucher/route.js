// Apply / release a voucher on the checkout page.
//  - apply:   reserves one use for this browser for 10 minutes (usage-limited codes), then tells the page what it takes off.
//  - release: gives the reservation back (Remove button, or the customer leaving the page).
// The reservation becomes the order's use when they pay (app/api/checkout/route.js).
import { createClient } from '@supabase/supabase-js';
import { json, sameOrigin, ipHash } from '../../../lib/security';
import { parseCart, priceCart } from '../../../lib/cart-server';
import { CODE_RE, TOKEN_RE, HOLD_MINUTES, MIN_CHARGE_CENTS, normalizeCode, priceLines, describeVoucher } from '../../../lib/vouchers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UNAVAILABLE = "This code isn't available right now."; // one message for every failure, so codes can't be probed

export async function POST(request) {
  try {
    return await handle(request);
  } catch (e) {
    console.error('voucher route crashed:', e && e.stack ? e.stack : e);
    return json({ ok: false, error: 'Something went wrong. Please try again.' }, 500);
  }
}

async function handle(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return json({ ok: false, error: 'Vouchers are not available right now.' }, 503);
  if (!sameOrigin(request)) return json({ ok: false, error: 'Request blocked.' }, 403);

  const raw = await request.text();
  if (raw.length > 10000) return json({ ok: false, error: 'Request too large.' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }
  if (!body || typeof body !== 'object') return json({ ok: false, error: 'Bad request.' }, 400);

  const token = String(body.token || '');
  if (!TOKEN_RE.test(token)) return json({ ok: false, error: 'Please reload the page and try again.' }, 400);
  const db = createClient(url, service, { auth: { persistSession: false } });

  if (body.action === 'release') {
    await db.rpc('release_voucher_hold', { p_token: token });
    return json({ ok: true });
  }

  const code = normalizeCode(body.code);
  if (!CODE_RE.test(code)) return json({ ok: false, error: UNAVAILABLE }, 422);

  const priced = await priceCart(db, parseCart(body.items));
  if (priced.error) return json({ ok: false, error: priced.error }, priced.status);

  const { data: rows, error: hErr } = await db.rpc('hold_voucher', { p_code: code, p_token: token, p_ip: ipHash(request), p_minutes: HOLD_MINUTES });
  if (hErr) { console.error('hold_voucher failed (has supabase/vouchers-reserve.sql been run?):', hErr.message); return json({ ok: false, error: 'Vouchers are not available right now.' }, 503); }
  const v = Array.isArray(rows) ? rows[0] : rows;
  if (!v) return json({ ok: false, error: UNAVAILABLE }, 422);

  const p = priceLines(priced.lines, v);
  if (p.totalCents < MIN_CHARGE_CENTS) {
    await db.rpc('release_voucher_hold', { p_token: token });
    return json({ ok: false, error: "This code can't be used on this order." }, 422);
  }
  return json({
    ok: true, code: v.code, label: describeVoucher(v),
    subtotal: p.subtotalCents / 100, discount: p.discountCents / 100, total: p.totalCents / 100,
    reservedMinutes: v.mode === 'limited' ? HOLD_MINUTES : 0,
  });
}
