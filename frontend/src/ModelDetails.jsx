import "./ModelDetails.css";

const features = ["Pregnancies", "Glucose", "Blood pressure", "Skin thickness", "Insulin", "BMI", "Pedigree function", "Age"];
const steps = [
  { n: "01", title: "Health inputs", sub: "8 measurements", icon: "✳", color: "mint" },
  { n: "02", title: "StandardScaler", sub: "Scale inputs", icon: "⇄", color: "blue" },
  { n: "03", title: "SelectKBest", sub: "5 selected features", icon: "⌘", color: "violet" },
  { n: "04", title: "Random Forest", sub: "Saved classifier", icon: "▦", color: "teal" },
  { n: "05", title: "Prediction", sub: "Model estimate", icon: "↗", color: "peach" },
];

export default function ModelDetails() {
  return <div className="md-page">
    <div className="md-heading"><div><span className="md-kicker">GLUCOCHECK / MODEL LAB</span><h2>Inside the model</h2><p>A visual guide to how the saved pipeline works.</p></div><span className="md-pill"><i /> Existing saved pipeline</span></div>
    <div className="md-stats">
      <article><span className="md-icon mint">▤</span><small>Dataset</small><strong>768 rows</strong><p>Pima Indians dataset</p></article>
      <article><span className="md-icon blue">⌘</span><small>Input variables</small><strong>08 inputs</strong><p>Original measurements</p></article>
      <article><span className="md-icon violet">◇</span><small>Feature selection</small><strong>05 selected</strong><p>SelectKBest pipeline</p></article>
      <article><span className="md-icon peach">▦</span><small>Inference model</small><strong>Random Forest</strong><p>Existing saved classifier</p></article>
    </div>
    <section className="md-panel md-pipeline"><div className="md-section-head"><div><span className="md-kicker">THE WORKFLOW</span><h3>From measurements to an estimate</h3></div><span className="md-count">5 STEPS</span></div>
      <div className="md-flow">{steps.map((s,i)=><div className="md-flow-part" key={s.n}><article className="md-step"><span className={`md-icon ${s.color}`}>{s.icon}</span><small>{s.n}</small><b>{s.title}</b><p>{s.sub}</p></article>{i<steps.length-1&&<span className="md-arrow">→</span>}</div>)}</div>
      <div className="md-note"><span>ⓘ</span>Workflow illustration only—not a performance or accuracy chart.</div>
    </section>
    <div className="md-lower">
      <section className="md-panel"><div className="md-section-head"><div><span className="md-kicker">INPUT MAP</span><h3>What goes into the model?</h3></div><span className="md-icon mint">⌘</span></div><div className="md-features">{features.map((f,i)=><div key={f}><span>{String(i+1).padStart(2,"0")}</span>{f}</div>)}</div><div className="md-foot"><i /> 8 original inputs → 5 selected features</div></section>
      <section className="md-panel"><span className="md-kicker">MODEL VISUAL</span><h3>Input → model → output</h3><div className="md-visual"><div className="md-data"><span>INPUT</span><div><i/><i/><i/><i/></div><small>Health data</small></div><b className="md-connector">→</b><div className="md-orb"><span>G</span><small>ML</small></div><b className="md-connector">→</b><div className="md-output"><span>✓</span><small>OUTPUT</small><b>Estimate</b></div></div><p className="md-caption">Illustration only. This panel does not generate a prediction.</p></section>
    </div>
    <footer className="md-disclaimer">Educational project <span>•</span> Not a medical diagnosis</footer>
  </div>;
}
