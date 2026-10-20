export default function ShopSection() {
  return (
    <section id="shop" className="shop" aria-labelledby="shop-title">
      <div className="container">
        <div className="shop-grid">
          <div>
            <p className="eyebrow">Where to Buy</p>
            <h2 id="shop-title">Order Fundy's Online</h2>
            <p>Order straight from this site and pay securely with GCash, Maya or card. We also pop up at bazaars and markets, where you can taste before you buy. <a href="#booths">See where we'll be next</a>.</p>
            <ul className="social-buttons">
              <li><a className="btn" href="#products">Order now</a></li>
              <li><a className="btn btn-social btn-facebook" href="https://www.facebook.com/share/1P3eAZ63ca/" target="_blank" rel="noopener me" aria-label="Follow on Facebook"><svg className="icon" aria-hidden="true"><use href="#i-facebook"/></svg><span className="btn-label">Follow on Facebook</span></a></li>
            </ul>
          </div>
          <figure className="shop-figure">
            <picture>
              <source srcSet="/images/booth.webp" type="image/webp" />
              <img src="/images/booth.jpg" width="800" height="1199" loading="lazy" alt="Fundy's bazaar booth with a red gingham tablecloth, green counter and a free taste sign" />
            </picture>
            <figcaption>Find us at bazaars and pop-ups for a free taste.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
