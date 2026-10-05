import Link from 'next/link';

export const metadata = {
  title: "403 – Staff only | Fundy's",
  robots: { index: false, follow: false },
};

// Where non-admin Google accounts land after trying to sign in at /admin.html.
// Uses the same layout and classes as the 404 page (app/not-found.js).
export default function Forbidden() {
  return (
    <main id="main" className="not-found">
      <div className="not-found-inner">
        <p className="not-found-code" aria-hidden="true">403</p>
        <h1>Staff only</h1>
        <p>This area is closed to the public. Entry is not permitted for this account.</p>
        <div className="cta-row cta-center">
          <Link className="btn" href="/">Back to home</Link>
          <Link className="btn btn-ghost" href="/#products">Shop products</Link>
        </div>
      </div>
    </main>
  );
}
