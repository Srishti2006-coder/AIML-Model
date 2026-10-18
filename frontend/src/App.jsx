import { useEffect, useState } from "react";
import "./styles.css";

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
  // App navigation state: 'welcome', 'auth', 'dashboard'
  const [screen, setScreen] = useState("welcome");
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  
  // Auth inputs
  const [email, setEmail] = useState("");
  const [password, др] = useState("");
  const [user, setUser] = useState(null);

  // Prediction form states
  const [form, setForm] = useState(empty);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5001/api/health")
      .then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then(() => setOnline(true)).catch(() => setOnline(false));
  }, []);

  const change = e => {
    setForm({...form, [e.target.name]: e.target.value});
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
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload)
      });
      const data = await r.json();
      if(!r.ok) throw new Error(data.error || "Prediction failed");
      setResult(data);
    } catch(err) {
      setError(err.message || "Could not connect to the prediction service.");
    } finally { setLoading(false); }
  };

  const handleAuth = e => {
    e.preventDefault();
    if(!email || !password) {
      alert("Please fill in all details");
      return;
    }
    setUser({ email });
    setScreen("dashboard");
  };

  const pct = result ? Math.round(result.diabetes_probability * 100) : 0;

  return (
    <div className="app-container">
      {/* Mobile Device Frame */}
      <div className="phone-frame">
        
        {/* Top Status Bar */}
        <div className="phone-header">
          <div className="logo">Gluco<span>Check</span></div>
          <div className={"status-badge " + (online ? "on" : "")}>
            <i/> {online ? "Online" : "Offline"}
          </div>
        </div>

        {/* SCREEN 1: WELCOME / SPLASH SCREEN */}
        {screen === "welcome" && (
          <div className="screen splash-screen">
            <div className="splash-icon">🩺</div>
            <h1>Understand diabetes risk in seconds.</h1>
            <p>Your pocket-friendly AI health screening assistant. Fast, secure, and powered by trained ML models.</p>
            <div className="splash-actions">
              <button className="btn-primary" onClick={() => { setAuthMode("signup"); setScreen("auth"); }}>
                Get Started →
              </button>
              <button className="btn-secondary" onClick={() => { setAuthMode("login"); setScreen("auth"); }}>
                I already have an account
              </button>
            </div>
            <span className="disclaimer-text">Educational screening tool — not medical advice</span>
          </div>
        )}

        {/* SCREEN 2: AUTH SCREEN (LOGIN / SIGNUP) */}
        {screen === "auth" && (
          <div className="screen auth-screen">
            <div className="auth-header">
              <h2>{authMode === "signup" ? "Create Account" : "Welcome Back"}</h2>
              <p>{authMode === "signup" ? "Sign up to track your health assessments" : "Log in to your GlucoCheck profile"}</p>
            </div>

            <form className="auth-form" onSubmit={handleAuth}>
              <label>
                <span>Email address</span>
                <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </label>
              <label>
                <span>Password</span>
                <input type="password" placeholder="••••••••" value={password} onChange={e => др(e.target.value)} required />
              </label>
              <button type="submit" className="btn-primary">
                {authMode === "signup" ? "Sign Up" : "Log In"}
              </button>
            </form>

            <div className="auth-switch">
              {authMode === "signup" ? (
                <p>Already have an account? <span onClick={() => setAuthMode("login")}>Log In</span></p>
              ) : (
                <p>Don't have an account? <span onClick={() => setAuthMode("signup")}>Sign Up</span></p>
              )}
              <button className="btn-text" onClick={() => setScreen("welcome")}>← Back to Home</button>
            </div>
          </div>
        )}

        {/* SCREEN 3: DASHBOARD & PREDICTION APP */}
        {screen === "dashboard" && (
          <div className="screen dashboard-screen">
            <div className="dash-top">
              <div>
                <small>Welcome back,</small>
                <h3>{user?.email || "User"}</h3>
              </div>
              <button className="btn-logout" onClick={() => { setUser(null); setScreen("welcome"); }}>Logout</button>
            </div>

            <div className="dash-content">
              <div className="card form-card">
                <div className="form-title-row">
                  <h4>Patient Measurements</h4>
                  <button type="button" className="btn-demo" onClick={demo}>Use Demo</button>
                </div>
                <form onSubmit={submit}>
                  <div className="fields-grid">
                    {fields.map(f => (
                      <label key={f[0]}>
                        <span>{f[1]} <small>{f[6]}</small></span>
                        <input name={f[0]} type="number" value={form[f[0]]} onChange={change} min={f[3]} max={f[4]} step={f[5]} placeholder="0"/>
                      </label>
                    ))}
                  </div>
                  {error && <div className="error-box">{error}</div>}
                  <button type="submit" className="btn-primary" disabled={loading} style={{marginTop: "16px"}}>
                    {loading ? "Analyzing risk..." : "Run Prediction"}
                  </button>
                </form>
              </div>

              {/* Result Card */}
              {result && (
                <div className="card result-card">
                  <div className="result-top">
                    <span>RESULT</span>
                    <b>✓</b>
                  </div>
                  <h3>{result.label}</h3>
                  <div className="prob-box">
                    <strong>{pct}%</strong>
                    <div>
                      <b>Estimated Risk Probability</b>
                      <small>Class 1 Model Output</small>
                    </div>
                  </div>
                  <div className="progress-bar"><div style={{width: pct + "%"}}/></div>
                  <div className="features-tags">
                    <small>Selected Features:</small>
                    <div>{result.selected_features.map(x => <span key={x}>{x}</span>)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}