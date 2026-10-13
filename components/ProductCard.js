import Core from '../public/fundys-core.js';
import AddToCartButton from './AddToCartButton';

// One product card. Everything comes from the Supabase `products` table (edited in /admin.html).
export default function ProductCard({ p, index, total }) {
  const d = Core.productDefaults(p);
  const img = p.image || d.image;
  const alt = p.imageAlt || d.alt;
  const src = Core.imageSrc(img);
  const webp = p.webp && /\.(jpe?g|png)$/i.test(img) ? src.replace(/\.(jpe?g|png)$/i, '.webp') : '';
  const badge = p.badge || (p.inStock === false ? 'Sold out' : '');
  const badgeClass = p.badge ? 'badge' : 'badge badge--soldout';

  return (
    <li className="product-card" id={p.id} aria-roledescription="slide" aria-label={`${index + 1} of ${total}`}>
      <article>
        <div className={'product-img' + (p.photo ? ' product-img--photo' : '')}>
          <picture>
            {webp ? <source srcSet={webp} type="image/webp" /> : null}
            <img src={src} width="700" height="700" loading="lazy" alt={alt} />
          </picture>
        </div>
        <h3>{p.title}</h3>
        <p className="product-size">{p.sizeLine || d.sizeLine}</p>
        {badge ? <p className={badgeClass}>{badge}</p> : null}
        <p className="product-desc">{p.description}</p>
        <p className="price"><span className="price-amount">{Core.formatPrice(p.price)}</span></p>
        <AddToCartButton product={{ id: p.id, title: p.title, price: p.price, image: img }} soldOut={p.inStock === false} />
            {tiktok ? (
              <a className="btn btn-tiktok" href={tiktok} target="_blank" rel="noopener" aria-label={`Buy Fundy's ${p.title} on TikTok Shop`}>TikTok Shop</a>
            ) : null}
          </div>
        ) : null}
      </article>
    </li>
  );
}
