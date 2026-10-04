export default function ContactSection() {
  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="container narrow">
        <header className="section-head">
          <p className="eyebrow">Get in Touch</p>
          <h2 id="contact-title">Questions or Reseller Inquiries?</h2>
          <p>Message or call us about orders, bulk packs and reseller packages.</p>
        </header>
        <ul className="contact-buttons">
          <li><a className="btn btn-contact" href="tel:+639666930825"><svg className="icon" aria-hidden="true"><use href="#i-phone"/></svg><span>Call</span></a></li>
          <li><a className="btn btn-whatsapp btn-contact" href="https://wa.me/639177994490" target="_blank" rel="noopener"><svg className="icon" aria-hidden="true"><use href="#i-whatsapp"/></svg><span>WhatsApp</span></a></li>
        </ul>
      </div>
    </section>
  );
}
