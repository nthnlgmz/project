import Link from 'next/link';

// Shown for any address that doesn't exist. It fills the space between the header and the footer
// (the layout keeps the footer at the bottom, see `body` and `.not-found` in globals.css).
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <div className="not-found-inner">
        <p className="not-found-code" aria-hidden="true">404</p>
        <h1>This page isn't on the shelf</h1>
        <p>The link may be broken or the page may have moved. Let's get you back to the good stuff.</p>
        <div className="cta-row cta-center">
          <Link className="btn" href="/">Back to home</Link>
          <Link className="btn btn-ghost" href="/#products">Shop products</Link>
        </div>
      </div>
    </main>
  );
}
