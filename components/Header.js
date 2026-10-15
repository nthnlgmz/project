'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from './CartProvider';
import AccountMenu from './AccountMenu';

// "/#section" works from every page: on the home page it scrolls, from /checkout or /privacy it goes home first.
const MAIN_LINKS = [
  { href: '/#products', label: 'Products' },
  { href: '/#nutrition', label: 'Nutrition' },
  { href: '/#about-us', label: 'About Us' },
];
const MORE_LINKS = [
  { href: '/#ways-to-enjoy', label: 'Ways to Enjoy' },
  { href: '/#booths', label: 'Booths' },
  { href: '/#faq', label: 'FAQs' },
  { href: '/#contact', label: 'Contact' },
];
const LINKS = [...MAIN_LINKS, ...MORE_LINKS]; // the phone menu lists everything

// Wide screens: logo on the left, links and the "Shop Now" button on the right.
// Small screens: burger menu on the left, logo in the middle, shopping cart (goes to Products) on the right.
export default function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);
  const moreRef = useRef(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();

  // keep the in-page scroll offset exactly equal to the sticky header's height (desktop and phone differ),
  // so a section starts right under the nav with no gap or overlap
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;
    const root = document.documentElement;
    const update = () => {
      root.style.scrollPaddingTop = Math.floor(el.getBoundingClientRect().height) + 'px';
    };
    update();
    // arriving from another page with #section in the address: re-align once the header height is known
    if (window.location.hash.length > 1) {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target) requestAnimationFrame(() => target.scrollIntoView());
    }
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.scrollPaddingTop = '';
    };
  }, []);

  // "More" dropdown: close with Esc or a click/tap outside it
  useEffect(() => {
    if (!moreOpen) return undefined;
    const away = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') { setMoreOpen(false); const b = moreRef.current && moreRef.current.querySelector('button'); if (b) b.focus(); } };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [moreOpen]);

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
            {MAIN_LINKS.map((l) => (
              <li key={l.href}><a href={l.href}>{l.label}</a></li>
            ))}
            <li className="nav-more" ref={moreRef}>
              <button type="button" className="nav-more-btn" aria-expanded={moreOpen} aria-haspopup="true" aria-controls="more-menu" onClick={() => setMoreOpen((v) => !v)}>
                More
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {moreOpen ? (
                <ul id="more-menu" className="nav-more-menu">
                  {MORE_LINKS.map((l) => (
                    <li key={l.href}><a href={l.href} onClick={() => setMoreOpen(false)}>{l.label}</a></li>
                  ))}
                </ul>
              ) : null}
            </li>
            <li><a className="btn btn-small" href="/#products">Shop Now</a></li>
          </ul>
        </nav>

        <div className="header-actions">
        <AccountMenu variant="desktop" />

        <button type="button" className="cart-link" onClick={() => setCartOpen(true)} aria-label={count ? `Open cart, ${count} item${count > 1 ? 's' : ''}` : 'Open cart'}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          {count > 0 ? <span className="cart-badge" aria-hidden="true">{count}</span> : null}
        </button>
        </div>
      </div>

      <nav id="mobile-menu" className={'mobile-menu' + (open ? ' open' : '')} aria-label="Menu">
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href} onClick={() => setOpen(false)}>{l.label}</a></li>
          ))}
          <li><AccountMenu variant="mobile" onDone={() => setOpen(false)} /></li>
        </ul>
      </nav>
    </header>
  );
}
