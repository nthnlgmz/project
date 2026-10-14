// Voucher rules shared by the preview route and the checkout route. The browser never decides a discount.
export const CODE_RE = /^[A-Z0-9_-]{3,32}$/;
export const MIN_CHARGE_CENTS = 2000; // PayMongo cannot charge less than 20 pesos

export const normalizeCode = (v) => String(v == null ? '' : v).trim().toUpperCase().replace(/\s+/g, '');

// Today's date in the Philippines (YYYY-MM-DD). Date vouchers are valid for this whole day only.
export const todayPH = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: 'numeric', day: 'numeric' })
    .format(new Date()).split('-').map((p, i) => (i ? p.padStart(2, '0') : p)).join('-');

export const describeVoucher = (v) =>
  v.discount_type === 'percent' ? Number(v.discount_value) + '% off' : '\u20B1' + Number(v.discount_value) + ' off';

// Read-only check used when a customer taps Apply. The real, atomic claim happens at checkout (redeem_voucher in SQL).
export function isUsable(v) {
  if (!v || !v.active) return false;
  if (v.mode === 'limited') return Number(v.used_count) < Number(v.max_uses);
  if (v.mode === 'date') return String(v.valid_on).slice(0, 10) === todayPH();
  return false;
}

// Spread the discount over the unit prices (PayMongo line items cannot be negative), so what the customer
// sees on the payment page adds up to exactly the order total we store.
export function priceLines(lines, voucher) {
  const unit = lines.map((l) => Math.round(l.price * 100));
  const subtotal = lines.reduce((n, l, i) => n + unit[i] * l.qty, 0);
  if (!voucher || subtotal <= 0) return { unitCents: unit, subtotalCents: subtotal, totalCents: subtotal, discountCents: 0 };
  const wanted = voucher.discount_type === 'percent'
    ? Math.round((subtotal * Number(voucher.discount_value)) / 100)
    : Math.min(Math.round(Number(voucher.discount_value) * 100), subtotal);
  const ratio = (subtotal - wanted) / subtotal;
  const after = unit.map((u) => Math.max(1, Math.round(u * ratio)));
  const total = lines.reduce((n, l, i) => n + after[i] * l.qty, 0);
  return { unitCents: after, subtotalCents: subtotal, totalCents: total, discountCents: subtotal - total };
}
