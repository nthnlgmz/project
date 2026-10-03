export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="logo" href="/" aria-label="Fundy's home">Fundy's</a>
        <nav aria-label="Primary" className="primary-nav">
          <ul>
            <li><a href="#products">Products</a></li>
            <li><a href="#why-fundys">Why Fundy's</a></li>
            <li><a href="#ways-to-enjoy">Ways to Enjoy</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a className="btn btn-small" href="#shop">Shop Now</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
