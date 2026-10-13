import { useEffect, useState } from "react";

const fields = [
  ["Pregnancies","Pregnancies","Number of pregnancies",0,20,1,""],
  ["Glucose","Glucose","Plasma glucose concentration",0,300,1,"mg/dL"],
  ["BloodPressure","Blood pressure","Diastolic blood pressure",0,200,1,"mm Hg"],
  ["SkinThickness","Skin thickness","Triceps skin fold thickness",0,100,1,"mm"],
  ["Insulin","Insulin","2-hour serum insulin",0,1000,1,"µU/mL"],
  ["BMI","BMI","Body mass index",0,80,0.1,""],
  ["DiabetesPedigreeFunction","Diabetes pedigree","Diabetes pedigree function",0,3,0.01,""],
  ["Age","Age","Age in years",1,120,1,"years"]
];

const empty = Object.fromEntries(fields.map(f => [f[0], ""]));

export default function App() {
  const [form,setForm] = useState(empty);
  const [result,setResult] = useState(null);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const [online,setOnline] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5001/api/health")
      .then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then(() => setOnline(true)).catch(() => setOnline(false));
  }, []);

  const change = e => {
    setForm({...form,[e.target.name]:e.target.value});
    setError("");
  };

  const demo = () => setForm({
    Pregnancies:"2", Glucose:"120", BloodPressure:"70", SkinThickness:"25",
    Insulin:"80", BMI:"28.5", DiabetesPedigreeFunction:"0.35", Age:"35"
  });

  const submit = async e => {
    e.preventDefault();
    if(fields.some(f => form[f[0]] === "")) {
      setError("Please enter all 8 values.");
      return;
    }
    setLoading(true); setError(""); setResult(null);
    try {
      const payload = Object.fromEntries(fields.map(f => [f[0], Number(form[f[0]])]));
      const r = await fetch("http://localhost:5001/api/predict", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data.error || "Prediction failed");
      setResult(data);
    } catch(err) {
      setError(err.message || "Could not connect to the prediction service.");
    } finally { setLoading(false); }
  };

  const pct = result ? Math.round(result.diabetes_probability * 100) : 0;

  return <div className="page">
    <header className="nav">
      <a className="logo" href="#">Gluco<span>Check</span></a>
      <nav><a href="#predict">Predict</a><a href="#how">How it works</a><a href="#about">About</a></nav>
      <div className={"status "+(online?"on":"")}><i/> {online?"System online":"API offline"}</div>
    </header>

    <section className="hero">
      <div>
        <div className="eyebrow">MACHINE LEARNING · HEALTH ANALYTICS</div>
        <h1>Understand diabetes risk in seconds.</h1>
        <p>Enter the clinical measurements used by the trained prediction pipeline. Your values are processed through the saved scaler, feature selector and Random Forest model.</p>
        <a className="cta" href="#predict">Start prediction →</a>
      </div>
      <div className="hero-panel">
        <div className="icon">+</div>
        <h3>AI-assisted screening</h3>
        <p>Fast model-based risk estimation</p>
        <hr/>
        <div className="stats"><div><b>8</b><small>input features</small></div><div><b>5</b><small>selected features</small></div></div>
      </div>
    </section>

    <section id="predict" className="predict">
      <div className="heading"><div><div className="eyebrow">PREDICTION</div><h2>Patient measurements</h2><p>All 8 original features are required because the saved preprocessing pipeline performs scaling and feature selection before prediction.</p></div><button onClick={demo}>Use demo values</button></div>
      <div className="grid">
        <form className="card form" onSubmit={submit}>
          <div className="fields">{fields.map(f => <label key={f[0]}>
            <span>{f[1]} <small>{f[6]}</small></span><em>{f[2]}</em>
            <input name={f[0]} type="number" value={form[f[0]]} onChange={change} min={f[3]} max={f[4]} step={f[5]} placeholder="Enter value"/>
          </label>)}</div>
          {error && <div className="error">{error}</div>}
          <div className="actions"><button className="primary" disabled={loading}>{loading?"Analyzing...":"Predict diabetes risk →"}</button><button type="button" onClick={()=>{setForm(empty);setResult(null)}}>Clear</button></div>
        </form>

        <aside className="card result">
          {!result ? <div className="empty"><div className="circle">◎</div><h3>Your result will appear here</h3><p>Complete the form and run the model to see the predicted class and probability.</p></div> :
          <div className="result-inner"><div className="result-head"><span>MODEL RESULT</span><b>✓</b></div>
            <h3>{result.label}</h3>
            <div className="prob"><strong>{pct}%</strong><span><b>Estimated probability</b><small>Probability for class 1</small></span></div>
            <div className="meter"><i style={{width:pct+"%"}}/></div>
            <div className="row"><span>Predicted class</span><b>{result.prediction}</b></div>
            <div className="selected"><small>Selected model features</small><div>{result.selected_features.map(x=><span key={x}>{x}</span>)}</div></div>
          </div>}
        </aside>
      </div>
    </section>

    <section id="how" className="how"><div className="eyebrow">PIPELINE</div><h2>From input to prediction</h2><div className="steps">
      {[
        ["01","Patient input","Eight original clinical features are collected."],
        ["02","Standardization","The saved StandardScaler applies training-time scaling."],
        ["03","Feature selection","SelectKBest keeps the five selected features."],
        ["04","Random Forest","The trained classifier returns class and probability."]
      ].map(s=><div className="step" key={s[0]}><b>{s[0]}</b><h3>{s[1]}</h3><p>{s[2]}</p></div>)}
    </div></section>

    <section id="about" className="about"><div><div className="eyebrow">ABOUT</div><h2>An end-to-end ML application.</h2></div><p>React provides the interface, Express handles the backend API, and Flask serves the trained Python model. The pipeline uses the saved scaler, SelectKBest selector and Random Forest classifier from your training work.</p></section>
    <footer>GlucoCheck · Diabetes Prediction System <span>Educational project — not a medical diagnosis</span></footer>
  </div>;
}