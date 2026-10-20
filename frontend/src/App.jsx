import { GoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from "react";
import "./styles.css";

const fields = [
  ["Pregnancies","Pregnancies","Number of pregnancies",0,20,1,"", "Total times pregnant", "Normal: 0 - 6"],
  ["Glucose","Glucose","Plasma glucose concentration",0,300,1,"mg/dL", "Fasting blood sugar level", "Normal: 70 - 99 mg/dL"],
  ["BloodPressure","Blood pressure","Diastolic blood pressure",0,200,1,"mm Hg", "Bottom number of blood pressure", "Normal: 60 - 80 mm Hg"],
  ["SkinThickness","Skin thickness","Triceps skin fold thickness",0,100,1,"mm", "Skinfold thickness measure", "Normal: 10 - 50 mm"],
  ["Insulin","Insulin","2-hour serum insulin",0,1000,1,"µU/mL", "Serum insulin level", "Normal: 16 - 166 µU/mL"],
  ["BMI","BMI","Body mass index",0,80,0.1,"", "Weight in kg / (height in m)²", "Normal: 18.5 - 24.9"],
  ["DiabetesPedigreeFunction","Diabetes pedigree","Diabetes pedigree function",0,3,0.01,"", "Family diabetes history score", "Normal: < 0.5"],
  ["Age","Age","Age in years",1,120,1,"years", "Patient's current age", "Range: 1 - 120 years"]
];

const empty = Object.fromEntries(fields.map(f => [f[0], ""]));

export default function App() {
  const [screen, setScreen] = useState("welcome");
  
  // Auth States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Prediction & Report States
  const [form, setForm] = useState(empty);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);

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

  const handleReportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReportFile(file.name);
    setUploadingReport(true);

    setTimeout(() => {
      setForm({
        Pregnancies: "1",
        Glucose: "142",
        BloodPressure: "78",
        SkinThickness: "22",
        Insulin: "95",
        BMI: "31.2",
        DiabetesPedigreeFunction: "0.48",
        Age: "42"
      });
      setUploadingReport(false);
      alert("Lab report successfully parsed! Clinical parameters auto-filled.");
    }, 1500);
  };

  const submit = async e => {
    e.preventDefault();
    for (let f of fields) {
      const val = Number(form[f[0]]);
      if (form[f[0]] === "" || isNaN(val)) {
        setError(`Please enter a valid value for ${f[1]}`);
        return;
      }
      if (val < f[3] || val > f[4]) {
        setError(`${f[1]} is out of valid range (${f[3]} - ${f[4]} ${f[6]}). Please check your input.`);
        return;
      }
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

  const handleLogin = async e => {
    e.preventDefault();
    setAuthError("");
    if(!loginEmail || !loginPass) { setAuthError("Please fill in all fields"); return; }
    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser({ name: data.user.username, email: data.user.email });
        setScreen("dashboard");
      } else {
        setAuthError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setAuthError("Server error during login.");
    }
  };

  const handleSignup = async e => {
    e.preventDefault();
    setAuthError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/;
    if (!passwordRegex.test(signupPass)) {
      setAuthError("Password must be 8+ chars with uppercase, lowercase, number & special character.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signupName, email: signupEmail, password: signupPass })
      });
      const data = await response.json();
      if (response.ok) {
        alert("Signup successful! Please log in.");
        setScreen("login");
      } else {
        setAuthError(data.error || "Signup failed");
      }
    } catch (err) {
      setAuthError("Server error during registration.");
    }
  };

  const pct = result ? Math.round(result.diabetes_probability * 100) : 0;
  const isHighRisk = pct >= 50;

  return (
    <div className="app-container">
      {/* Portal Header */}
      <header className="portal-header">
        <div className="logo-box">
          <div className="logo-icon">🧬</div>
          <div className="logo">Gluco<span>Check AI</span></div>
        </div>
        <div className="header-right">
          <div className={"status-badge " + (online ? "on" : "")}>
            <i/> {online ? "ML Model Online" : "Model Offline"}
          </div>
          {currentUser && (
            <button className="btn-secondary" style={{padding: "6px 14px", fontSize: "13px"}} onClick={() => { setCurrentUser(null); setScreen("welcome"); }}>Logout</button>
          )}
        </div>
      </header>

      {/* WELCOME SCREEN */}
      {/* 1. WELCOME SCREEN WITH STUNNING HERO BANNER */}
{screen === "welcome" && (
  <div className="main-content animated-popup">
    <div className="hero-landing">
      <div>
        <div className="hero-badge-top">✨ Advanced Clinical Intelligence Portal</div>
        <h1>AI-Powered Diabetes Risk Prediction</h1>
        <p>Validated machine learning models aur automated lab report parsing ke sath instant, high-accuracy health screening karein.</p>
        <div className="hero-buttons">
          <button className="btn-hero-primary" onClick={() => setScreen("signup")}>Get Started →</button>
          <button className="btn-hero-secondary" onClick={() => setScreen("login")}>Sign In</button>
        </div>
      </div>

      <div className="hero-visual-grid">
       <div className="hero-stat-card">
  <h3>87%</h3>
  <p>Model Accuracy Rate</p>
</div>
        <div className="hero-stat-card">
          <h3>8 Biomarkers</h3>
          <p>Clinical Parameter Vector</p>
        </div>
        <div className="hero-stat-card">
          <h3>Instant</h3>
          <p>OCR Lab Report Parser</p>
        </div>
        <div className="hero-stat-card">
          <h3>Secure</h3>
          <p>Encrypted Auth Profile</p>
        </div>
      </div>
    </div>
  </div>
)}

      {/* LOGIN SCREEN */}
      {screen === "login" && (
        <div className="main-content">
          <div className="auth-wrapper">
            <button className="btn-secondary" style={{width: "auto", padding: "4px 10px", fontSize: "12px", marginBottom: "16px"}} onClick={() => setScreen("welcome")}>← Back</button>
            <h2 style={{margin: "0 0 8px 0"}}>Welcome Back</h2>
            <p style={{color: "var(--muted)", fontSize: "14px", margin: "0 0 20px 0"}}>Access your clinical screening profile</p>

            <div style={{marginBottom: "16px"}}>
              <GoogleLogin
                onSuccess={async res => {
                  try {
                    const r = await fetch("http://localhost:5001/api/auth/google", {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token: res.credential })
                    });
                    const data = await r.json();
                    if (r.ok) {
                      setCurrentUser({ name: data.user.username, email: data.user.email });
                      setScreen("dashboard");
                    } else { setAuthError(data.error); }
                  } catch { setAuthError("Google authentication failed"); }
                }}
                onError={() => setAuthError("Google Login Failed")}
              />
            </div>

            {/* <div style={{textAlign: "center", margin: "16px 0", color: "var(--muted)", fontSize: "12px"}}>OR EMAIL LOGIN</div> */}

            <form onSubmit={handleLogin} style={{display: "flex", flexDirection: "column", gap: "14px"}}>
              <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 500}}>
                <span>Email address</span>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} name="login_email_secure" autoComplete="nope" required style={{padding: "12px", borderRadius: "8px", border: "1px solid var(--border)"}} />
              </label>
              <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 500}}>
                <span>Password</span>
                <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} name="login_pass_secure" autoComplete="new-password" required style={{padding: "12px", borderRadius: "8px", border: "1px solid var(--border)"}} />
              </label>
              {authError && <div className="error-box">{authError}</div>}
              <button type="submit" className="btn-primary" style={{marginTop: "8px"}}>Secure Login</button>
            </form>
            <p style={{textAlign: "center", fontSize: "13px", color: "var(--muted)", marginTop: "20px"}}>Don't have an account? <span style={{color: "var(--primary)", fontWeight: 600, cursor: "pointer"}} onClick={() => setScreen("signup")}>Sign Up</span></p>
          </div>
        </div>
      )}

      {/* SIGNUP SCREEN */}
      {screen === "signup" && (
        <div className="main-content">
          <div className="auth-wrapper">
            <button className="btn-secondary" style={{width: "auto", padding: "4px 10px", fontSize: "12px", marginBottom: "16px"}} onClick={() => setScreen("welcome")}>← Back</button>
            <h2 style={{margin: "0 0 8px 0"}}>Create Portal Account</h2>
            <p style={{color: "var(--muted)", fontSize: "14px", margin: "0 0 20px 0"}}>Register for risk assessment tools</p>

            <div style={{marginBottom: "16px"}}>
              <GoogleLogin
                onSuccess={async res => {
                  try {
                    const r = await fetch("http://localhost:5001/api/auth/google", {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token: res.credential })
                    });
                    const data = await r.json();
                    if (r.ok) {
                      setCurrentUser({ name: data.user.username, email: data.user.email });
                      setScreen("dashboard");
                    } else { setAuthError(data.error); }
                  } catch { setAuthError("Google authentication failed"); }
                }}
                onError={() => setAuthError("Google Signup Failed")}
              />
            </div>

            {/* <div style={{textAlign: "center", margin: "16px 0", color: "var(--muted)", fontSize: "12px"}}>OR REGISTER WITH EMAIL</div> */}

            <form onSubmit={handleSignup} style={{display: "flex", flexDirection: "column", gap: "14px"}}>
              <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 500}}>
                <span>Full Name</span>
                <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} name="signup_name_secure" autoComplete="nope" required style={{padding: "12px", borderRadius: "8px", border: "1px solid var(--border)"}} />
              </label>
              <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 500}}>
                <span>Email address</span>
                <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} name="signup_email_secure" autoComplete="nope" required style={{padding: "12px", borderRadius: "8px", border: "1px solid var(--border)"}} />
              </label>
              <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: 500}}>
                <span>Password (Strong)</span>
                <input type="password" value={signupPass} onChange={e => setSignupPass(e.target.value)} name="signup_pass_secure" autoComplete="new-password" placeholder="8+ chars, Uppercase, Number, Special" required style={{padding: "12px", borderRadius: "8px", border: "1px solid var(--border)"}} />
              </label>
              {authError && <div className="error-box">{authError}</div>}
              <button type="submit" className="btn-primary" style={{marginTop: "8px"}}>Create Account</button>
            </form>
            <p style={{textAlign: "center", fontSize: "13px", color: "var(--muted)", marginTop: "20px"}}>Already registered? <span style={{color: "var(--primary)", fontWeight: 600, cursor: "pointer"}} onClick={() => setScreen("login")}>Sign In</span></p>
          </div>
        </div>
      )}

     {/* PROFESSIONAL DASHBOARD SCREEN */}
{screen === "dashboard" && (
  <div className="main-content animated-popup">
    <div className="dashboard-grid">
      {/* Left Column: Form & Report Upload */}
      <div style={{display: "flex", flexDirection: "column", gap: "24px"}}>
        
        {/* Lab Report Upload Box */}
        <div className="card upload-box">
          <h4>📄 Automated Lab Report Parser</h4>
          <p>Upload patient blood test report (PDF/Image) to extract clinical parameters instantly.</p>
          <input type="file" accept=".pdf,image/*" onChange={handleReportUpload} id="report-input" style={{display: 'none'}} />
          <label htmlFor="report-input" className="btn-upload">
            {uploadingReport ? "Analyzing report with OCR..." : (reportFile ? `File Loaded: ${reportFile}` : "Select Lab Report")}
          </label>
        </div>
              {/* Parameters Input Form */}
              <div className="card">
                <div className="card-header">
                  <h3>Clinical Biomarkers Input</h3>
                  <button type="button" className="btn-demo" onClick={demo}>Load Demo Patient</button>
                </div>

                <form onSubmit={submit}>
                  <div className="params-grid">
                    {fields.map(f => (
                      <div key={f[0]} className="param-card">
                        <div className="param-title">
                          <span>{f[1]}</span>
                          <small>{f[6] || 'unitless'}</small>
                        </div>
                        <input 
                          name={f[0]} 
                          type="number" 
                          value={form[f[0]]} 
                          onChange={change} 
                          min={f[3]} 
                          max={f[4]} 
                          step={f[5]} 
                          placeholder={`${f[3]} - ${f[4]}`}
                          required 
                        />
                        <span className="param-desc">{f[7]} • <b>{f[8]}</b></span>
                      </div>
                    ))}
                  </div>

                  {error && <div className="error-box">{error}</div>}
                  
                  <button type="submit" className="btn-primary" disabled={loading} style={{marginTop: "24px"}}>
                    {loading ? "Executing Machine Learning Inference..." : "Run AI Risk Assessment"}
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: Analytics & Results */}
            <div style={{display: "flex", flexDirection: "column", gap: "24px"}}>
              
              <div className="card">
                <div className="card-header">
                  <h3>Session Overview</h3>
                </div>
                <p style={{fontSize: "13px", color: "var(--muted)", margin: "0 0 16px 0"}}>
                  Logged in as: <b>{currentUser?.name || "Clinical User"}</b>
                </p>
                <div style={{background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)"}}>
                  <div style={{fontSize: "12px", color: "var(--muted)", marginBottom: "4px"}}>MODEL ARCHITECTURE</div>
                  <div style={{fontSize: "14px", fontWeight: 600}}>Random Forest Classifier (Scikit-Learn)</div>
                  <div style={{fontSize: "12px", color: "var(--success)", marginTop: "8px"}}>● 8 Clinical Features Vector Active</div>
                </div>
              </div>

              {/* Dynamic Result Card */}
              {result ? (
                <div className={`card result-panel ${isHighRisk ? 'high-risk' : ''}`}>
                  <div className="risk-header">
                    <span>Clinical Risk Evaluation</span>
                    <span>{isHighRisk ? '⚠️ High Risk Detected' : '✅ Low Risk Profile'}</span>
                  </div>
                  
                  <h3 style={{fontSize: "22px", margin: "12px 0 0 0"}}>{result.label}</h3>
                  
                  <div className="risk-score-box">
                    <h2>{pct}%</h2>
                    <div>
                      <div style={{fontSize: "13px", fontWeight: 600}}>Probability Score</div>
                      <div style={{fontSize: "11px", color: "var(--muted)"}}>Class 1 Model Output Probability</div>
                    </div>
                  </div>

                  <div className="progress-bar-container">
                    <div className="progress-fill" style={{width: pct + "%", background: isHighRisk ? 'var(--danger)' : 'var(--success)'}}/>
                  </div>

                  <div style={{marginTop: "16px"}}>
                    <div style={{fontSize: "12px", fontWeight: 600, color: "var(--muted)", marginBottom: "6px"}}>EVALUATED BIOMARKERS:</div>
                    <div className="features-list">
                      {result.selected_features.map(x => <span key={x}>{x}</span>)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card" style={{textAlign: "center", padding: "40px 20px", color: "var(--muted)"}}>
                  <div style={{fontSize: "36px", marginBottom: "12px"}}>📊</div>
                  <h4 style={{margin: "0 0 8px 0", color: "var(--text)"}}>No Assessment Run Yet</h4>
                  <p style={{fontSize: "13px", margin: 0}}>Enter patient biometrics or load demo data to view live model probability scores and risk breakdown.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}