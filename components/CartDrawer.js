'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Core from '../public/fundys-core.js';
import { useCart, peso } from './CartProvider';

export default function CartDrawer() {
  const { items, open, setOpen, setQty, total, count } = useCart();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    if (closeRef.current) closeRef.current.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, setOpen]);

  return (
    <div className={'cart-drawer' + (open ? ' open' : '')} aria-hidden={!open}>
      <div className="cart-backdrop" onClick={() => setOpen(false)} />
      <aside className="cart-panel" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="cart-head">
          <h2>Your cart{count ? ` (${count})` : ''}</h2>
          <button type="button" className="cart-close" ref={closeRef} onClick={() => setOpen(false)} aria-label="Close cart">&times;</button>
        </div>
        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <a className="btn" href="/#products" onClick={() => setOpen(false)}>Browse the spreads</a>
          </div>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((i) => (
                <li key={i.id}>
                  {i.image ? <img src={Core.imageSrc(i.image)} alt="" width="64" height="64" /> : null}
                  <div className="cart-info">
                    <strong>{i.title}</strong>
                    <span>{peso(i.price)} each</span>
                    <div className="qty" role="group" aria-label={`Quantity for ${i.title}`}>
                      <button type="button" onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease quantity">&minus;</button>
                      <span aria-live="polite">{i.qty}</span>
                      <button type="button" onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                  <div className="cart-line">
                    <strong>{peso(i.price * i.qty)}</strong>
                    <button type="button" className="cart-remove" onClick={() => setQty(i.id, 0)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-foot">
              <p className="cart-total"><span>Subtotal</span><strong>{peso(total)}</strong></p>
              <Link className="btn" href="/checkout" onClick={() => setOpen(false)}>Checkout</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
