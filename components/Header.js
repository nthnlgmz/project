'use client';

import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { href: '#products', label: 'Products' },
  { href: '#nutrition', label: 'Nutrition' },
  { href: '#about-us', label: 'About Us' },
  { href: '#ways-to-enjoy', label: 'Ways to Enjoy' },
  { href: '#booths', label: 'Booths' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];

// Wide screens: logo on the left, links and the "Shop Now" button on the right.
// Small screens: burger menu on the left, logo in the middle, shopping cart (goes to Products) on the right.
export default function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  // close the menu with Esc or when tapping outside the header
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [open]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container header-inner">
        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <a className="logo" href="/" aria-label="Fundy's home"><img src="/images/logo-pill.webp" width="839" height="339" alt="Fundy's" /></a>

        <nav aria-label="Primary" className="primary-nav">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}><a href={l.href}>{l.label}</a></li>
            ))}
            <li><a className="btn btn-small" href="#products">Shop Now</a></li>
          </ul>
        </nav>

        <a className="cart-link" href="#products" aria-label="Shop our products">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </a>
      </div>

      <nav id="mobile-menu" className={'mobile-menu' + (open ? ' open' : '')} aria-label="Menu">
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href} onClick={() => setOpen(false)}>{l.label}</a></li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
