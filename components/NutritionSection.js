import { NUTRITION } from '../lib/nutrition';

// Alternative layout, no photo: the label sits beside four "at a glance" tiles taken from the same data.
// Rename this file to NutritionSection.js to use it.
const GLANCE = [
  { label: 'Energy', caption: 'calories per tablespoon' },
  { label: 'Protein', caption: 'protein per tablespoon' },
  { label: 'Calcium', caption: 'calcium per tablespoon' },
  { label: 'Trans Fat', caption: 'trans fat' },
];

export default function NutritionSection() {
  const n = NUTRITION[0];
  const tiles = GLANCE.map((g) => {
    const row = n.rows.find((r) => r.label === g.label);
    return row ? { value: row.value, caption: g.caption } : null;
  }).filter(Boolean);

  return (
    <section id="nutrition" className="nutrition" aria-labelledby="nutrition-title">
      <div className="container">
        <header className="section-head">
          <p className="eyebrow">Know What You Eat</p>
          <h2 id="nutrition-title">Nutrition Facts</h2>
          <p>Every jar is 200g, about 10 servings. Here is what is in one tablespoon, and it is the same for all four flavors.</p>
        </header>

        <style>{`
          .nf-split{display:grid;grid-template-columns:1fr;gap:2rem;justify-items:center;align-items:center}
          .nf-glance{width:min(340px,100%);text-align:center}
          .nf-glance-title{font-family:var(--font-script);font-size:2.2rem;line-height:1;color:var(--red);margin:0 0 1rem}
          .nf-tiles{display:grid;grid-template-columns:1fr 1fr;gap:.9rem;margin:0;padding:0;list-style:none}
          .nf-tile{background:var(--cream);border:3px solid var(--brown);border-radius:var(--radius);padding:1rem .6rem;box-shadow:var(--shadow)}
          .nf-tile strong{display:block;font-family:var(--font-body);font-weight:800;font-size:1.7rem;line-height:1.1;color:var(--red)}
          .nf-tile span{display:block;margin-top:.45rem;font-size:.85rem;line-height:1.3;color:var(--muted)}
          .nf-glance-note{margin:1.1rem 0 0;font-weight:700;color:var(--brown)}
          @media (min-width:900px){
            .nf-split{grid-template-columns:380px 380px;justify-content:center;gap:4rem}
            .nf-split .nf-label{font-size:1.05rem}
            .nf-glance{width:380px}
            .nf-tile{padding:1.4rem .8rem}
            .nf-tile strong{font-size:2rem}
          }
        `}</style>

        <div className="nf-split">
          <figure className="nf-card" style={{ margin: 0, width: 'min(380px,100%)' }}>
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

          <div className="nf-glance">
            <p className="nf-glance-title" aria-hidden="true">At a glance</p>
            <ul className="nf-tiles">
              {tiles.map((t) => (
                <li className="nf-tile" key={t.caption}>
                  <strong>{t.value}</strong>
                  <span>{t.caption}</span>
                </li>
              ))}
            </ul>
            <p className="nf-glance-note">Made with imported Edam cheese.</p>
          </div>
        </div>
      </div>
    </section>
  );
                  }
