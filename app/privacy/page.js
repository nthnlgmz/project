import Link from 'next/link';

export const metadata = {
  title: "Privacy Policy | Fundy's",
  description: "How Fundy's collects, uses and protects your personal information when you order or sign in.",
  alternates: { canonical: '/privacy' },
};

const UPDATED = 'October 14, 2026';

export default function PrivacyPage() {
  return (
    <main id="main" className="legal">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Your data</p>
          <h1 className="co-title">Privacy Policy</h1>
          <p className="legal-updated">Last updated {UPDATED}</p>
        </header>

        <article className="legal-card">
          <p>
            Fundy's Spreads ("Fundy's", "we", "us") respects your privacy. This page explains what personal information we collect when you
            order from this website or sign in with Google, why we collect it, who we share it with, and the choices you have. We follow the
            Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li><strong>Order details:</strong> your full name, mobile number, email address, delivery address (region, province, city or municipality, barangay, street, postal code) and any notes you add.</li>
            <li><strong>What you ordered:</strong> the products, quantities, total, payment method used (for example GCash or Maya) and order status.</li>
            <li><strong>Google sign-in (optional):</strong> your name and email address from your Google account. We never see your Google password.</li>
            <li><strong>Saved details (optional):</strong> if you tick "Save my details for next time", the name, contact details and address above, so we can fill them in for your next order.</li>
          </ul>
          <p>
            <strong>We do not store your card or e-wallet details.</strong> Payments are handled on PayMongo's secure payment page.
          </p>

          <h2>Why we use it</h2>
          <ul>
            <li>To take, confirm, pack and deliver your order, and to contact you about it.</li>
            <li>To send your payment receipt and order updates.</li>
            <li>To fill in your details faster next time, only if you chose to save them.</li>
            <li>To keep business, accounting and legal records, and to prevent fraud and misuse.</li>
          </ul>
          <p>We do not sell your personal information, and we do not use it for advertising.</p>

          <h2>Who we share it with</h2>
          <p>We only share what is needed to run the shop, with:</p>
          <ul>
            <li><strong>PayMongo</strong>, which processes your payment and sends the receipt.</li>
            <li><strong>Our delivery partners</strong>, who receive your name, mobile number and address to deliver your order.</li>
            <li><strong>Our technology providers</strong> that host this website and store our data securely (Vercel and Supabase), and <strong>Google</strong> if you use Google sign-in.</li>
            <li>Government agencies or other parties, only when the law requires it.</li>
          </ul>

          <h2>How long we keep it</h2>
          <p>
            Order records are kept for as long as needed for delivery, customer service, accounting and legal requirements. Saved details are kept
            until you delete them or ask us to. You can delete saved details yourself on the <Link href="/checkout">checkout page</Link> (sign in, then choose
            "Delete saved details").
          </p>

          <h2>Cookies and local storage</h2>
          <p>
            We store your cart and, if you sign in, your sign-in session in your browser's storage so the site works as expected. We do not use
            advertising cookies.
          </p>

          <h2>Your rights</h2>
          <p>Under the Data Privacy Act you have the right to:</p>
          <ul>
            <li>be informed about how your information is used, and to access the information we hold about you;</li>
            <li>correct information that is wrong or out of date;</li>
            <li>object to the use of your information, or withdraw your consent, at any time;</li>
            <li>ask us to delete or block your information, and to receive a copy of it;</li>
            <li>file a complaint with the National Privacy Commission (privacy.gov.ph) if you believe your rights were violated.</li>
          </ul>

          <h2>Contact us</h2>
          <p>
            To use any of these rights or to ask about this policy, contact Fundy's at JP Rizal St., Brgy. Pipisik, Gumaca, Quezon, or call{' '}
            <a href="tel:+639666930825">0966-693-0825</a>.
          </p>

          <h2>Changes to this policy</h2>
          <p>If we change how we handle personal information, we will update this page and the date at the top.</p>
        </article>
      </div>
    </main>
  );
}
