// Turns the browser's cart ({id, qty}) into trusted lines with prices read from the products table.
export function parseCart(raw) {
  const wanted = new Map();
  (Array.isArray(raw) ? raw.slice(0, 30) : []).forEach((i) => {
    const qty = Math.floor(Number(i && i.qty));
    if (i && typeof i.id === 'string' && /^[\w.-]{1,64}$/.test(i.id) && qty >= 1 && qty <= 50) {
      wanted.set(i.id, Math.min((wanted.get(i.id) || 0) + qty, 50));
    }
  });
  return wanted;
}

export async function priceCart(db, wanted) {
  if (!wanted.size) return { error: 'Your cart is empty.', status: 400 };
  const { data: products, error } = await db.from('products').select('*').in('id', [...wanted.keys()]);
  if (error) return { error: 'Could not load products.', status: 500 };
  const lines = [];
  const images = {};
  for (const [id, qty] of wanted) {
    const p = (products || []).find((x) => x.id === id);
    if (!p || p.visible === false || p.in_stock === false) {
      return { error: 'One of the items is no longer available. Please review your cart.', status: 409 };
    }
    lines.push({ id, title: p.title, price: Number(p.price), qty });
    images[id] = p.image ? (/^https?:\/\//i.test(p.image) ? p.image : '/' + String(p.image).replace(/^\/+/, '')) : '';
  }
  if (!lines.length || !lines.every((l) => l.price > 0)) return { error: 'Invalid order total.', status: 400 };
  return { lines, images };
}
