export default function ShopSection() {
  return (
    <section id="shop" className="shop" aria-labelledby="shop-title">
      <div className="container">
        <div className="shop-grid">
          <div>
            <p className="eyebrow">Where to Buy</p>
            <h2 id="shop-title">Order Fundy's Online</h2>
            <p>Our full range is available on Shopee and TikTok Shop. We also pop up at bazaars and markets, where you can taste before you buy. <a href="#booths">See where we'll be next</a>.</p>
            <ul className="social-buttons">
              <li><a className="btn btn-social btn-shopee" href="https://ph.shp.ee/pDAPXb2F" target="_blank" rel="noopener" aria-label="Shop on Shopee"><svg className="icon" aria-hidden="true"><use href="#i-shopee"/></svg><span className="btn-label">Shop on Shopee</span></a></li>
              <li><a className="btn btn-social btn-tiktok" href="https://vt.tiktok.com/ZS9DhRoY41tqs-isnu7/" target="_blank" rel="noopener" aria-label="Shop on TikTok"><svg className="icon" aria-hidden="true"><use href="#i-tiktok"/></svg><span className="btn-label">Shop on TikTok</span></a></li>
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
