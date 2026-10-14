'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth, displayName } from './AuthProvider';

const USER_ICON = 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2.25c-3.2 0-9 1.6-9 4.8V21h18v-1.95c0-3.2-5.8-4.8-9-4.8z';

// variant "desktop": round button in the header. variant "mobile": one line inside the burger menu.
export default function AccountMenu({ variant = 'desktop', onDone }) {
  const { user, ready, available, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  if (!available || !ready) return null;

  if (variant === 'mobile') {
    return user ? (
      <>
        <a className="mobile-account" href="/account/orders" onClick={() => { if (onDone) onDone(); }}>My orders</a>
        <button type="button" className="mobile-account" onClick={() => { signOut(); if (onDone) onDone(); }}>Sign out <span>{user.email}</span></button>
      </>
    ) : (
      <button type="button" className="mobile-account" onClick={() => signIn()}>Sign in with Google</button>
    );
  }

  if (!user) {
    return (
      <button type="button" className="account-btn" onClick={() => signIn()} aria-label="Sign in with Google" title="Sign in">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={USER_ICON} /></svg>
      </button>
    );
  }
  const initial = (displayName(user) || user.email || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="account-wrap" ref={ref}>
      <button type="button" className="account-btn signed" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label="Your account">{initial}</button>
      {open ? (
        <div className="account-pop" role="menu">
          <p>Signed in as<br /><strong>{user.email}</strong></p>
          <a className="account-link" role="menuitem" href="/account/orders">My orders</a>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); signOut(); }}>Sign out</button>
        </div>
      ) : null}
    </div>
  );
}
