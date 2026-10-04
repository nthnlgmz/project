import Year from './Year';

// The footer is drawn as a jar of Fundy's Spread: silver lid, glass neck, cheese, and a white label
// (the same shape as the real label: a dome with the logo, then a wide band with the links).
export default function Footer() {
  return (
    <footer className="site-footer jar">
      <div className="jar-lid" aria-hidden="true" />
      <div className="jar-glass" aria-hidden="true" />
      <div className="jar-body">
        <div className="jar-label">
          <div className="jar-arch">
            <a className="logo" href="/" aria-label="Fundy's home">Fundy's</a>
            <p className="jar-tagline">
              Fundy's Spread
              <br />
              Made with Imported Edam Cheese
            </p>
          </div>
          <div className="jar-band">
            <nav aria-label="Footer">
              <ul className="jar-links">
                <li><a href="https://ph.shp.ee/pDAPXb2F" rel="noopener me" target="_blank">Shopee</a></li>
                <li><a href="https://vt.tiktok.com/ZS9DhRoY41tqs-isnu7/" rel="noopener me" target="_blank">TikTok</a></li>
                <li><a href="https://www.facebook.com/share/1P3eAZ63ca/" rel="noopener me" target="_blank">Facebook</a></li>
              </ul>
            </nav>
            <p className="footer-contact">
              <a href="tel:+639666930825" aria-label="Call Fundy's"><svg className="icon" aria-hidden="true"><use href="#i-phone" /></svg></a>
              <a href="https://wa.me/639177994490" target="_blank" rel="noopener" aria-label="Message Fundy's on WhatsApp"><svg className="icon" aria-hidden="true"><use href="#i-whatsapp" /></svg></a>
            </p>
            <p className="jar-copy">&copy; <Year initial={new Date().getFullYear()} /> Fundy's. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
