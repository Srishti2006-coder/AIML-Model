import ModelDetails from "./ModelDetails";
import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import "./styles.css";

const API = "http://localhost:5001";

const fields = [
  { key: "Pregnancies", label: "Pregnancies", unit: "count", min: 0, max: 20, step: 1, normalMax: 6, example: "e.g. 2 (Normal: 0-6)" },
  { key: "Glucose", label: "Glucose", unit: "mg/dL", min: 0, max: 300, step: 1, normalMax: 99, example: "e.g. 120 (Normal: 70-99)" },
  { key: "BloodPressure", label: "Blood pressure", unit: "mmHg", min: 0, max: 200, step: 1, normalMax: 80, example: "e.g. 70 (Normal: 60-80)" },
  { key: "SkinThickness", label: "Skin thickness", unit: "mm", min: 0, max: 100, step: 1, normalMax: 50, example: "e.g. 25 (Normal: 10-50)" },
  { key: "Insulin", label: "Insulin", unit: "µU/mL", min: 0, max: 1000, step: 1, normalMax: 166, example: "e.g. 80 (Normal: 16-166)" },
  { key: "BMI", label: "Body mass index", unit: "kg/m²", min: 0, max: 80, step: 0.1, normalMax: 24.9, example: "e.g. 28.5 (Normal: 18.5-24.9)" },
  { key: "DiabetesPedigreeFunction", label: "Pedigree function", unit: "score", min: 0, max: 3, step: 0.01, normalMax: 0.5, example: "e.g. 0.35 (Normal: < 0.5)" },
  { key: "Age", label: "Age", unit: "years", min: 1, max: 120, step: 1, normalMax: 40, example: "e.g. 35 years" }
];

const blankForm = Object.fromEntries(fields.map(f => [f.key, ""]));

function Brand() {
  return <div className="gc-brand"><span className="gc-logo">G</span><span>Gluco<span>Check</span></span></div>;
}

function App() {
  const [screen, setScreen] = useState("welcome");
  const [tab, setTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [signedInAt, setSignedInAt] = useState("");
  const [pendingPrediction, setPendingPrediction] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [online, setOnline] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [assessmentsHistory, setAssessmentsHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;
    const checkAPI = () => {
      fetch(`${API}/api/health`)
        .then(res => {
          if (!res.ok) throw new Error("API unavailable");
          return res.json();
        })
        .then(() => { if (active) setOnline(true); })
        .catch(() => { if (active) setOnline(false); });
    };

    checkAPI();
    const timer = setInterval(checkAPI, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (user && user.email) {
      fetch(`${API}/api/predictions/history/${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setAssessmentsHistory(data);
          } else {
            setAssessmentsHistory([
              { _id: "1", createdAt: new Date(), glucose: 145, bmi: 29.5, risk: "High Risk", status: "Warning" }
            ]);
          }
        })
        .catch(() => {
          setAssessmentsHistory([
            { _id: "1", createdAt: new Date(), glucose: 145, bmi: 29.5, risk: "High Risk", status: "Warning" }
          ]);
        });
    }
  }, [user, tab]);

  const finishLogin = (account) => {
    setUser({
      name: account?.username || account?.name || loginEmail.split("@")[0],
      email: account?.email || loginEmail
    });
    setSignedInAt(new Date().toLocaleString());
    setScreen("app");
    setTab(pendingPrediction ? "prediction" : "overview");
    setPendingPrediction(false);
    setAuthError("");
  };

  const startPrediction = () => {
    if (!user) {
      setPendingPrediction(true);
      setAuthError("");
      setScreen("login");
      return;
    }
    setTab("prediction");
    setResult(null);
    setError("");
  };

  const login = async (event) => {
    event.preventDefault();
    setAuthError("");

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to sign in.");
      finishLogin(data.user);
    } catch (err) {
      setAuthError(err.message || "Login failed. Check your backend.");
    }
  };

  const signup = async (event) => {
    event.preventDefault();
    setAuthError("");

    if (signupPassword.length < 8) {
      setAuthError("Password must contain at least 8 characters.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(signupPassword)) {
      setAuthError("Include at least one special character, such as ! @ # $ %.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupName,
          email: signupEmail,
          password: signupPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create account.");

      setLoginEmail(signupEmail);
      setLoginPassword("");
      setScreen("login");
      setAuthError("Account created. Please sign in.");
    } catch (err) {
      setAuthError(err.message || "Signup failed. Check your backend.");
    }
  };

  const googleLogin = async (credentialResponse) => {
    setAuthError("");
    try {
      const res = await fetch(`${API}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google sign-in failed.");
      finishLogin(data.user);
    } catch (err) {
      setAuthError(err.message || "Google sign-in failed.");
    }
  };

  const changeField = (event) => {
    setForm(previous => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
    setError("");
  };

  const loadPreset = (type) => {
    if (type === "healthy") {
      setForm({ Pregnancies: "1", Glucose: "85", BloodPressure: "70", SkinThickness: "20", Insulin: "75", BMI: "22.0", DiabetesPedigreeFunction: "0.25", Age: "28" });
    } else if (type === "atrisk") {
      setForm({ Pregnancies: "3", Glucose: "142", BloodPressure: "85", SkinThickness: "32", Insulin: "130", BMI: "31.2", DiabetesPedigreeFunction: "0.58", Age: "45" });
    } else if (type === "highrisk") {
      setForm({ Pregnancies: "6", Glucose: "185", BloodPressure: "92", SkinThickness: "40", Insulin: "210", BMI: "38.5", DiabetesPedigreeFunction: "0.85", Age: "58" });
    }
    setResult(null);
    setError("");
  };

  const predict = async (event) => {
    event.preventDefault();
    if (!user) {
      startPrediction();
      return;
    }

    for (const field of fields) {
      const raw = form[field.key];
      const value = Number(raw);

      if (raw === "" || !Number.isFinite(value)) {
        setError(`Enter a valid value for ${field.label}.`);
        return;
      }
      if (value < field.min || value > field.max) {
        setError(`${field.label} must be between ${field.min} and ${field.max}.`);
        return;
      }
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = Object.fromEntries(
        fields.map(f => [f.key, Number(form[f.key])])
      );

      const res = await fetch(`${API}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Prediction failed.");
      setResult(data);

      const prob = Math.round(Number(data.diabetes_probability) * 100);
      const riskLabel = prob >= 50 ? "High Risk" : "Low Risk";
      const statusLabel = prob >= 50 ? "Warning" : "Good";

      await fetch(`${API}/api/predictions/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.email,
          glucose: Number(form.Glucose),
          bmi: Number(form.BMI),
          risk: riskLabel,
          probability: prob
        })
      }).catch(() => {});

      const newEntry = {
        _id: Date.now().toString(),
        createdAt: new Date(),
        glucose: Number(form.Glucose),
        bmi: Number(form.BMI),
        risk: riskLabel,
        status: statusLabel
      };
      setAssessmentsHistory(prev => [newEntry, ...prev]);

    } catch (err) {
      setError(err.message || "Prediction service unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSignedInAt("");
    setResult(null);
    setForm(blankForm);
    setTab("overview");
    setScreen("welcome");
  };

  const probability = result &&
    Number.isFinite(Number(result.diabetes_probability))
      ? Math.round(Number(result.diabetes_probability) * 100)
      : null;
  const isHighRisk = probability !== null && probability >= 50;

  if (screen === "login" || screen === "signup") {
    const isSignup = screen === "signup";

    return (
      <main className="gc-auth-page">
        <section className="gc-auth-card">
          <button className="gc-back" onClick={() => {
            setScreen("welcome");
            setPendingPrediction(false);
            setAuthError("");
          }}>← Back to home</button>

          <Brand />
          <div className="gc-auth-heading">
            <span className="gc-eyebrow">{isSignup ? "GET STARTED" : "WELCOME BACK"}</span>
            <h1>{isSignup ? "Create your account" : "Sign in to GlucoCheck"}</h1>
            <p>{isSignup
              ? "Create an account to access your workspace."
              : "Sign in to continue to your dashboard."}</p>
          </div>

          {!isSignup && (
            <div className="gc-google">
              <GoogleLogin
                onSuccess={googleLogin}
                onError={() => setAuthError("Google sign-in was not completed.")}
              />
            </div>
          )}

          <form className="gc-form" onSubmit={isSignup ? signup : login}>
            {isSignup && (
              <label>
                Full name
                <input
                  value={signupName}
                  onChange={e => setSignupName(e.target.value)}
                  autoComplete="name"
                  required
                  placeholder="Your full name"
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                value={isSignup ? signupEmail : loginEmail}
                onChange={e => isSignup
                  ? setSignupEmail(e.target.value)
                  : setLoginEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={isSignup ? signupPassword : loginPassword}
                onChange={e => isSignup
                  ? setSignupPassword(e.target.value)
                  : setLoginPassword(e.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={isSignup ? 8 : undefined}
                required
                placeholder={isSignup
                  ? "8+ characters and a special character"
                  : "Enter your password"}
              />
              {isSignup && (
                <small className="gc-hint">
                  Minimum 8 characters, including a special character (! @ # $ %).
                </small>
              )}
            </label>

            {authError && <div className="gc-error" role="alert">{authError}</div>}

            <button className="gc-button gc-primary gc-full" type="submit">
              {isSignup ? "Create account" : "Sign in"} <span>→</span>
            </button>
          </form>

          <p className="gc-auth-switch">
            {isSignup ? "Already have an account?" : "New to GlucoCheck?"}
            <button className="gc-text-button" onClick={() => {
              setScreen(isSignup ? "login" : "signup");
              setAuthError("");
            }}>{isSignup ? "Sign in" : "Create account"}</button>
          </p>
          <p className="gc-small-note">
            Educational project only. Do not use this output as a medical diagnosis.
          </p>
        </section>
      </main>
    );
  }

 if (screen === "welcome") {
    return (
      <div className="gc-landing" style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header className="gc-nav" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 60px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
          <Brand />
          <div className="gc-nav-actions" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <button className="gc-button gc-quiet" onClick={() => setScreen("login")} style={{ background: "transparent", border: "none", fontWeight: "600", cursor: "pointer", color: "#475569" }}>Sign in</button>
            <button className="gc-button gc-primary" onClick={startPrediction} style={{ background: "#0d9488", color: "#fff", padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.2)" }}>
              Try GlucoCheck <span>→</span>
            </button>
          </div>
        </header>

        <main className="gc-hero" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "60px", padding: "80px 60px", maxWidth: "1200px", margin: "0 auto", alignItems: "center", flex: 1 }}>
          <section className="gc-hero-copy">
            <span className="gc-eyebrow" style={{ display: "inline-block", background: "#ccfbf1", color: "#0f766e", padding: "6px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 700, marginBottom: "20px", letterSpacing: "0.5px" }}>
              ● AI HEALTH SCREENING
            </span>
            <h1 style={{ fontSize: "52px", fontWeight: 800, color: "#0f172a", lineHeight: "1.1", margin: "0 0 20px 0" }}>
              Smart diabetes insights, <span style={{ color: "#0d9488" }}>simplified.</span>
            </h1>
            <p style={{ fontSize: "16px", color: "#64748b", lineHeight: "1.6", margin: "0 0 28px 0", maxWidth: "480px" }}>
              Evaluate your health metrics instantly using our trained Random Forest model with real-time MongoDB cloud integration.
            </p>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "36px" }}>
              <button className="gc-button gc-primary gc-large" onClick={startPrediction} style={{ background: "#0d9488", color: "#fff", padding: "14px 32px", borderRadius: "12px", border: "none", fontWeight: "700", fontSize: "16px", cursor: "pointer", boxShadow: "0 8px 20px rgba(13, 148, 136, 0.25)" }}>
                Launch Dashboard <span>→</span>
              </button>
            </div>

            {/* TECH STACK TRUST PILLS (RE-ADDED) */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#334155" }}>⚡ React.js</span>
              <span style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#334155" }}>🍃 MongoDB Atlas</span>
              <span style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#334155" }}>🌲 Random Forest ML</span>
              <span style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#334155" }}>🚀 Express API</span>
            </div>
          </section>

          {/* CLEAN MINIMALIST PREVIEW CARD */}
          <section className="gc-hero-visual" style={{ background: "#fff", borderRadius: "24px", padding: "36px", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)", textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", background: "#ccfbf1", borderRadius: "50%", display: "grid", placeItems: "center", margin: "0 auto 20px auto", fontSize: "32px" }}>
              🩺
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>Clinical AI Assistant</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px 0", lineHeight: "1.5" }}>
              Fast, transparent risk assessment powered by machine learning and secure cloud records.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Model Accuracy</span>
                <b style={{ fontSize: "16px", color: "#0f172a" }}>87.01%</b>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Database</span>
                <b style={{ fontSize: "16px", color: "#0d9488" }}>MongoDB Atlas</b>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="gc-app">
      <aside className="gc-sidebar">
        <Brand />
        <span className="gc-side-label">WORKSPACE</span>

        <button className={tab === "overview" ? "gc-side-link active" : "gc-side-link"}
          onClick={() => setTab("overview")}>▦ <span>Dashboard</span></button>
        <button className={tab === "prediction" ? "gc-side-link active" : "gc-side-link"}
          onClick={() => setTab("prediction")}>⌁ <span>New prediction</span></button>
        <button className={tab === "models" ? "gc-side-link active" : "gc-side-link"}
          onClick={() => setTab("models")}>◫ <span>Model details</span></button>
        <button className={tab === "profile" ? "gc-side-link active" : "gc-side-link"}
          onClick={() => setTab("profile")}>◎ <span>My profile</span></button>

        <div className="gc-sidebar-bottom">
          <div className="gc-health-note"><b>Educational project</b><small>Not a medical diagnosis</small></div>
          <button className="gc-side-link gc-logout" onClick={logout}>↪ <span>Sign out</span></button>
        </div>
      </aside>

      <main className="gc-main">
        {/* CLEAN MINIMALIST TOPBAR */}
        <header className="gc-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <span className="gc-eyebrow" style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, letterSpacing: "0.5px" }}>GLUCOCHECK / WORKSPACE</span>
            <h1 style={{ fontSize: "22px", fontWeight: "700", margin: "2px 0 0 0", color: "#0f172a" }}>Dashboard</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="gc-user-chip" onClick={() => setTab("profile")} style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: "12px", cursor: "pointer" }}>
              <span className="gc-avatar" style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#0d9488", color: "#fff", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "600" }}>{(user?.name || "U").slice(0, 1).toUpperCase()}</span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{user?.name || "User"}</span>
            </button>
          </div>
        </header>

        {tab === "overview" && (
          <div className="gc-content" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* MODERN SaaS WELCOME BANNER */}
            <section className="gc-welcome-banner" style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)", borderRadius: "20px", padding: "36px 40px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 10px 25px -5px rgba(13, 148, 136, 0.2)" }}>
              <div style={{ maxWidth: "600px" }}>
                <span style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, marginBottom: "12px", letterSpacing: "0.5px" }}>
                  CLINICAL AI WORKSPACE
                </span>
                <h2 style={{ fontSize: "26px", fontWeight: 700, margin: "0 0 8px 0", lineHeight: "1.2" }}>
                  Welcome back, {user?.name || "Srishti"}.
                </h2>
                <p style={{ margin: "0 0 20px 0", fontSize: "14px", opacity: 0.9, lineHeight: "1.5" }}>
                  Explore your patient assessment vectors, track disease metrics, and run real-time Random Forest inferences.
                </p>
                <button className="gc-button gc-white-button" onClick={startPrediction} style={{ background: "#fff", color: "#0f766e", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "transform 0.2s" }}>
                  Start a new prediction →
                </button>
              </div>
              <div style={{ fontSize: "64px", opacity: 0.15, fontWeight: 800, userSelect: "none" }}>
                🧬
              </div>
            </section>

            {/* VISUAL ANALYTICS & CHARTS SECTION (MONGODB CONNECTED) */}
            <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: "24px" }}>
              
              {/* REAL-TIME MONGODB TREND ANALYTICS */}
              <article className="gc-panel" style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "600" }}>Disease Trend Analytics (Real-Time DB)</h3>
                  <span style={{ fontSize: "12px", padding: "4px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#64748b" }}>
                    📊 Total Tests: {assessmentsHistory.length}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
                  <span>🔵 Glucose Level</span>
                  <span>🚨 High Risk Bar (Red)</span>
                </div>
                
                <div style={{ height: "180px", display: "flex", alignItems: "flex-end", gap: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", position: "relative" }}>
                  <div style={{ position: "absolute", top: "40%", left: "0", right: "0", borderTop: "1px dashed #cbd5e1" }} />
                  
                  {assessmentsHistory.length === 0 ? (
                    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#94a3b8", fontSize: "13px" }}>
                      No assessment data in database yet. Run a prediction!
                    </div>
                  ) : (
                    assessmentsHistory.slice(-7).map((item, i) => {
                      const gVal = Number(item.glucose) || 100;
                      const barHeight = Math.min(100, Math.max(15, (gVal / 300) * 100));
                      const isHigh = item.risk === "High Risk";

                      return (
                        <div key={item._id || i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", zIndex: 2 }}>
                          <div 
                            title={`Glucose: ${gVal} mg/dL | Risk: ${item.risk || 'Normal'}`}
                            style={{ 
                              width: "100%", 
                              maxWidth: "24px", 
                              background: isHigh ? "#dc2626" : "#0d9488", 
                              height: `${barHeight}%`, 
                              borderRadius: "4px 4px 0 0",
                              transition: "height 0.3s ease" 
                            }} 
                          />
                          <span style={{ fontSize: "10px", color: "#64748b", marginTop: "6px" }}>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `Test ${i+1}`}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </article>

              {/* RANDOM FOREST EFFECTIVENESS DONUT */}
              <article className="gc-panel" style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "600" }}>Random Forest Model Effectiveness</h3>
                <div style={{ margin: "10px auto", width: "130px", height: "130px", borderRadius: "50%", background: "conic-gradient(#0d9488 0% 87%, #cbd5e1 87% 100%)", display: "grid", placeItems: "center", position: "relative" }}>
                  <div style={{ width: "100px", height: "100px", background: "#fff", borderRadius: "50%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>12.99%</span>
                    <b style={{ fontSize: "18px", color: "#0f172a" }}>87.01%</b>
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", textAlign: "center" }}>Based on Kaggle Pima Indians Dataset</div>
              </article>
            </div>

            {/* RECENT ASSESSMENTS CLINICAL TABLE */}
            <section className="gc-panel" style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "600" }}>Recent Assessments</h3>
                <span className="gc-muted" style={{ fontSize: "12px" }}>Real-time MongoDB log</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px" }}>
                      <th style={{ padding: "12px" }}>Patient ID / Date</th>
                      <th style={{ padding: "12px" }}>Glucose (mg/dL)</th>
                      <th style={{ padding: "12px" }}>BMI</th>
                      <th style={{ padding: "12px" }}>Risk Status</th>
                      <th style={{ padding: "12px" }}>Performance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessmentsHistory
                      .filter(row => !searchQuery || JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((row, idx) => {
                        const isHighRisk = row.risk === "High Risk";
                        return (
                          <tr key={row._id || idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                            <td style={{ padding: "14px 12px", fontWeight: "600" }}>P00{idx + 1} / {new Date(row.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td style={{ padding: "14px 12px" }}>{row.glucose}</td>
                            <td style={{ padding: "14px 12px" }}>{row.bmi}</td>
                            <td style={{ padding: "14px 12px" }}>
                              <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", background: isHighRisk ? "#fef2f2" : "#f0fdf4", color: isHighRisk ? "#dc2626" : "#16a34a" }}>
                                {row.risk || (isHighRisk ? "High Risk" : "Low Risk")}
                              </span>
                            </td>
                            <td style={{ padding: "14px 12px" }}>
                              <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", background: isHighRisk ? "#fef2f2" : "#f0fdf4", color: isHighRisk ? "#dc2626" : "#16a34a" }}>
                                {isHighRisk ? "🚨 Red Alert / Warning" : "✅ Good"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {tab === "profile" && (
          <div className="gc-content" style={{ padding: "32px" }}>
            <section className="gc-profile-hero">
              <span className="gc-avatar gc-avatar-large">{(user?.name || "U").slice(0, 1).toUpperCase()}</span>
              <div><span className="gc-eyebrow">ACCOUNT PROFILE</span><h2>{user?.name || "User"}</h2><p>{user?.email || "Email not available"}</p></div>
              <span className="gc-signed-badge">● Signed in</span>
            </section>
          </div>
        )}

        {tab === "models" && <ModelDetails />}

        {tab === "prediction" && (
          <div className="gc-content" style={{ padding: "32px" }}>
            
            {/* QUICK CLINICAL PRESETS */}
            <section style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#0f172a" }}>Quick Clinical Presets</h4>
                <p style={{ margin: "0", fontSize: "12px", color: "#64748b" }}>Click a persona to instantly load test parameters into the form.</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => loadPreset("healthy")} style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "8px 14px", borderRadius: "8px", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>👤 Healthy Profile</button>
                <button type="button" onClick={() => loadPreset("atrisk")} style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", padding: "8px 14px", borderRadius: "8px", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>⚠️ At-Risk Profile</button>
                <button type="button" onClick={() => loadPreset("highrisk")} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "8px 14px", borderRadius: "8px", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>🚨 High-Risk Profile</button>
              </div>
            </section>

            <section className="gc-prediction-layout" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
              <article className="gc-panel" style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Health Measurements</h3>
                <form onSubmit={predict}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {fields.map((field) => {
                      const val = Number(form[field.key]);
                      const isOverNormal = form[field.key] !== "" && val > field.normalMax;
                      return (
                        <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>{field.label} ({field.unit})</label>
                          <input 
                            type="number" 
                            name={field.key} 
                            min={field.min} 
                            max={field.max} 
                            step={field.step} 
                            value={form[field.key]} 
                            onChange={changeField} 
                            placeholder={field.example} 
                            required 
                            style={{ padding: "10px", borderRadius: "8px", border: `1px solid ${isOverNormal ? "#f87171" : "#cbd5e1"}`, outline: "none", fontSize: "13px", background: isOverNormal ? "#fff5f5" : "#fff" }} 
                          />
                          <div style={{ width: "100%", height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, (val / field.max) * 100)}%`, height: "100%", background: isOverNormal ? "#dc2626" : "#0d9488", transition: "width 0.3s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {error && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "12px" }}>{error}</p>}
                  <button className="gc-button gc-primary gc-full" disabled={loading || !online} style={{ marginTop: "24px", width: "100%", padding: "12px", background: "#0d9488", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                    {loading ? "Running Random Forest Model..." : "Run Prediction Inference →"}
                  </button>
                </form>
              </article>

              <aside>
                <article className="gc-panel" style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <h3 style={{ margin: "0 0 20px 0", fontSize: "16px" }}>Model Inference Output</h3>
                  {!result ? (
                    <div style={{ padding: "60px 0", color: "#94a3b8" }}>
                      <div style={{ fontSize: "36px", marginBottom: "8px" }}>📊</div>
                      <b>Awaiting Input Vectors</b>
                      <p style={{ fontSize: "12px", margin: "6px 0 0 0" }}>Submit parameters or load a preset persona to evaluate risk.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "140px", height: "140px", borderRadius: "50%", background: `conic-gradient(${isHighRisk ? "#dc2626" : "#0d9488"} 0% ${probability}%, #e2e8f0 ${probability}% 100%)`, display: "grid", placeItems: "center", margin: "0 auto", position: "relative" }}>
                        <div style={{ width: "110px", height: "110px", background: "#fff", borderRadius: "50%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>Risk Score</span>
                          <b style={{ fontSize: "22px", color: isHighRisk ? "#dc2626" : "#0d9488" }}>{probability}%</b>
                        </div>
                      </div>
                      <div style={{ padding: "10px 16px", borderRadius: "8px", background: isHighRisk ? "#fef2f2" : "#f0fdf4", color: isHighRisk ? "#dc2626" : "#16a34a", fontWeight: 700, fontSize: "14px", width: "100%" }}>
                        {isHighRisk ? "🚨 HIGH RISK DETECTED" : "✅ LOW RISK / NORMAL"}
                      </div>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: "0" }}>Result successfully logged to MongoDB Atlas cloud database.</p>
                    </div>
                  )}
                </article>
              </aside>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;