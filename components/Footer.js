import Year from './Year';

// Footer styled like the Fundy's product label: a cream band with a dome on top holding the logo and tagline,
// then three columns (address, where to find us, short blurb), like the label's layout.
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-dome">
        <a className="logo" href="/" aria-label="Fundy's home"><img src="/images/logo-pill.webp" width="839" height="339" alt="Fundy's" /></a>
        <p>Gourmet Cheese Spread<br />Made with Imported Edam Cheese</p>
      </div>

      <div className="footer-band">
        <div className="container footer-cols">
          <div className="footer-col footer-address">
            <p>
              <strong>Product of the Philippines</strong><br />
              JP Rizal St. Brgy Pipisik Gumaca, Quezon<br />
              <a href="tel:+639666930825">0966-693-0825</a>
            </p>
            <p className="footer-contact">
              <a href="tel:+639666930825" aria-label="Call Fundy's"><svg className="icon" aria-hidden="true"><use href="#i-phone" /></svg></a>
              <a href="https://wa.me/639177994490" target="_blank" rel="noopener" aria-label="Message Fundy's on WhatsApp"><svg className="icon" aria-hidden="true"><use href="#i-whatsapp" /></svg></a>
            </p>
          </div>

          <nav className="footer-col footer-find" aria-label="Footer">
            <p className="footer-script" aria-hidden="true">Find Us</p>
            <ul>
              <li><a href="https://ph.shp.ee/pDAPXb2F" rel="noopener me" target="_blank">Shopee</a></li>
              <li><a href="https://vt.tiktok.com/ZS9DhRoY41tqs-isnu7/" rel="noopener me" target="_blank">TikTok</a></li>
              <li><a href="https://www.facebook.com/share/1P3eAZ63ca/" rel="noopener me" target="_blank">Facebook</a></li>
            </ul>
          </nav>

          <div className="footer-col footer-blurb">
            <p>Made with real Edam Cheese imported from the Netherlands. Perfect on crackers, toasted bread, or as a dip with chips.</p>
          </div>
        </div>
        <p className="copyright">&copy; <Year initial={new Date().getFullYear()} /> Fundy's. All rights reserved.</p>
      </div>
    </footer>
  );
}
