'use client';
import { useState } from 'react';
import { useCart } from './CartProvider';

function pulse(el) {
  if (el && el.animate) el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
}

// Copies the product photo and flies it to the header cart icon. Skipped for people who prefer reduced motion.
function flyToCart(button) {
  const cart = document.querySelector('.cart-link');
  const img = button.closest('.product-card') && button.closest('.product-card').querySelector('.product-img img');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!cart || !img || reduce || !img.animate) { pulse(cart); return; }

  const from = img.getBoundingClientRect();
  const to = cart.getBoundingClientRect();
  const size = Math.min(from.width, from.height, 120);
  const startX = from.left + from.width / 2, startY = from.top + from.height / 2;
  const dx = to.left + to.width / 2 - startX, dy = to.top + to.height / 2 - startY;

  const ghost = document.createElement('img');
  ghost.src = img.currentSrc || img.src;
  ghost.alt = '';
  ghost.setAttribute('aria-hidden', 'true');
  Object.assign(ghost.style, {
    position: 'fixed', left: startX - size / 2 + 'px', top: startY - size / 2 + 'px', width: size + 'px', height: size + 'px',
    objectFit: 'contain', background: '#fff', borderRadius: '50%', border: '3px solid #9b1313',
    boxShadow: '0 8px 20px rgba(0,0,0,.35)', zIndex: '200', pointerEvents: 'none',
  });
  document.body.appendChild(ghost);

  const anim = ghost.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${dx * 0.45}px,${dy * 0.45 - 70}px) scale(.7)`, opacity: 1, offset: 0.45 },
    { transform: `translate(${dx}px,${dy}px) scale(.15)`, opacity: 0.5 },
  ], { duration: 750, easing: 'cubic-bezier(.45,.05,.35,1)' });
  const done = () => { ghost.remove(); pulse(cart); };
  anim.onfinish = done;
  anim.oncancel = () => ghost.remove();
}

export default function AddToCartButton({ product, soldOut }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  if (soldOut) return <div className="buy-row buy-row--single"><button type="button" className="btn btn-ghost" disabled>Sold out</button></div>;
  return (
    <div className="buy-row buy-row--single">
      <button
        type="button"
        className="btn"
        onClick={(e) => { flyToCart(e.currentTarget); add(product); setAdded(true); setTimeout(() => setAdded(false), 1400); }}
        aria-label={`Add Fundy's ${product.title} to cart`}
      >{added ? 'Added \u2713' : 'Add to cart'}</button>
    </div>
  );
}
