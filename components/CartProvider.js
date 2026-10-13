'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'fundys-cart-v1';
const Ctx = createContext(null);

// Cart lives in the browser (localStorage). Only id + qty matter: the server re-reads prices when you check out.
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(saved)) setItems(saved.filter((i) => i && i.id && i.qty > 0));
    } catch (e) { /* ignore a broken cart */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* storage blocked */ }
  }, [items, ready]);

  const add = useCallback((p, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.id === p.id);
      if (found) return cur.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + qty, 50) } : i));
      return [...cur, { id: p.id, title: p.title, price: Number(p.price) || 0, image: p.image || '', qty }];
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((id, qty) => {
    setItems((cur) => cur.flatMap((i) => (i.id !== id ? [i] : qty <= 0 ? [] : [{ ...i, qty: Math.min(qty, 50) }])));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items, ready, open, setOpen, add, setQty, clear,
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((n, i) => n + i.qty * i.price, 0),
  }), [items, ready, open, add, setQty, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used inside <CartProvider>');
  return c;
}

export const peso = (n) => '\u20B1' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
