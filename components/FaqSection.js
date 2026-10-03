import { FAQ } from '../lib/faq';

export default function FaqSection() {
  return (
    <section id="faq" className="faq" aria-labelledby="faq-title">
      <div className="container narrow">
        <header className="section-head">
          <p className="eyebrow">Good to Know</p>
          <h2 id="faq-title">Frequently Asked Questions</h2>
        </header>
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
