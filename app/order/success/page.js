import Link from 'next/link';
import ClearCart from './ClearCart';

export const metadata = { title: "Thank you | Fundy's", robots: { index: false, follow: false } };

export default async function Success({ searchParams }) {
  const { o } = await searchParams;
  const ref = typeof o === 'string' && /^FND-[A-Z0-9]{6}$/.test(o) ? o : '';
  return (
    <main id="main" className="not-found">
      <ClearCart />
      <div className="not-found-inner">
        <p className="not-found-code" aria-hidden="true">Salamat!</p>
        <h1>Your order is in</h1>
        <p>Thank you for ordering Fundy's. A payment receipt is on its way to your email{ref ? <>, and your order number is <strong>{ref}</strong></> : null}. We'll contact you about delivery.</p>
        <div className="cta-row cta-center">
          <Link className="btn" href="/">Back to home</Link>
        </div>
      </div>
    </main>
  );
}
