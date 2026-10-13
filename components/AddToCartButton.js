'use client';
import { useState } from 'react';
import { useCart } from './CartProvider';

export default function AddToCartButton({ product, soldOut }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  if (soldOut) return <div className="buy-row buy-row--single"><button type="button" className="btn btn-ghost" disabled>Sold out</button></div>;
  return (
    <div className="buy-row buy-row--single">
      <button
        type="button"
        className="btn"
        onClick={() => { add(product); setAdded(true); setTimeout(() => setAdded(false), 1400); }}
        aria-label={`Add Fundy's ${product.title} to cart`}
      >{added ? 'Added \u2713' : 'Add to cart'}</button>
    </div>
  );
}
