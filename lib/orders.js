// Shared checks for the checkout form. The server runs these again, never trust the browser.
export const FIELDS = ['name', 'email', 'phone', 'line1', 'line2', 'city', 'province', 'postal', 'notes'];

export function validate(f) {
  const e = {};
  const t = (k) => String(f[k] || '').trim();
  if (t('name').length < 2) e.name = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t('email'))) e.email = 'Please enter a valid email.';
  const digits = t('phone').replace(/[^\d+]/g, '');
  if (!/^(\+?63|0)9\d{9}$/.test(digits)) e.phone = 'Enter a Philippine mobile number, e.g. 0917 123 4567.';
  if (t('line1').length < 5) e.line1 = 'Please enter your street address.';
  if (t('city').length < 2) e.city = 'Please enter your city or municipality.';
  if (t('province').length < 2) e.province = 'Please enter your province.';
  if (!/^\d{4}$/.test(t('postal'))) e.postal = 'Postal code is 4 digits.';
  return e;
}
