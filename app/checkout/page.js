import { Suspense } from 'react';
import CheckoutForm from './CheckoutForm';

export const metadata = { title: "Checkout | Fundy's", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <main id="main" className="checkout">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Almost there</p>
          <h1 className="co-title">Checkout</h1>
        </header>
        <Suspense fallback={null}><CheckoutForm /></Suspense>
      </div>
    </main>
  );
}
