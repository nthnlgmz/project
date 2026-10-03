import Year from './Year';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <a className="logo" href="/" aria-label="Fundy's home">Fundy's</a>
          <p>Fundy's Spread made with Imported Edam Cheese.</p>
          <p className="footer-contact"><a href="tel:+639666930825">0966 693 0825</a> &middot; <a href="https://wa.me/639177994490" target="_blank" rel="noopener">WhatsApp +63 917 799 4490</a></p>
        </div>
        <nav aria-label="Footer">
          <ul>
            <li><a href="https://ph.shp.ee/pDAPXb2F" rel="noopener me" target="_blank">Shopee</a></li>
            <li><a href="https://vt.tiktok.com/ZS9DhRoY41tqs-isnu7/" rel="noopener me" target="_blank">TikTok</a></li>
            <li><a href="https://www.facebook.com/share/1P3eAZ63ca/" rel="noopener me" target="_blank">Facebook</a></li>
          </ul>
        </nav>
      </div>
      <p className="copyright">&copy; <Year initial={new Date().getFullYear()} /> Fundy's. All rights reserved.</p>
    </footer>
  );
}
