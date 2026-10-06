import { NUTRITION } from '../lib/nutrition';

export default function NutritionSection() {
  return (
    <section id="nutrition" className="nutrition" aria-labelledby="nutrition-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Know What You Eat</p>
          <h2 id="nutrition-title">Nutrition Facts</h2>
          <p>Every jar is 200g, about 10 servings. Here is what is in one tablespoon, and it is the same for all four flavors.</p>
        </header>
        <div className="nf-grid">
          {NUTRITION.map((n) => (
            <figure className="nf-card" key={n.flavors.join('-')}>
              <figcaption className="nf-for">{n.title || n.flavors.join(' & ')}</figcaption>
              <table className="nf-label">
                <caption>Nutrition Facts</caption>
                <tbody>
                  <tr className="nf-serving"><td colSpan="2">Serving size: {n.serving}<br />Servings per container: {n.perContainer}</td></tr>
                  <tr className="nf-amount"><th colSpan="2" scope="colgroup">Amount / Serving</th></tr>
                  {n.rows.map((r) => (
                    <tr key={r.label} className={r.indent ? 'nf-indent' : ''}>
                      <th scope="row" className={r.bold ? 'nf-bold' : ''}>{r.label}</th>
                      <td className={r.bold ? 'nf-bold' : ''}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="nf-foot">{n.footnote}</p>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
