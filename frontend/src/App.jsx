import { GoogleLogin } from '@react-oauth/google';
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
  const [screen, setScreen] = useState("welcome"); // 'welcome', 'login', 'signup', 'dashboard'
  
  // Auth States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [authError, setAuthError] = useState("");
  
  const [currentUser, setCurrentUser] = useState(null);

  // Prediction States
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
    if(fields.some(f => form[f[0]] === "" || form[f[0]] === undefined || form[f[0]] === null)) {
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

  // Connected to Backend Login API
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
      console.error("Login error:", err);
      setAuthError("Server error during login. Make sure backend is running.");
    }
  };

  // Connected to Backend Signup API
  const handleSignup = async e => {
    e.preventDefault();
    setAuthError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setAuthError("Please enter a valid email address (e.g. name@example.com)");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(signupPass)) {
      setAuthError("Password must be 8+ chars with uppercase, lowercase, number & special character (@$!%*?&)");
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
      console.error("Signup error:", err);
      setAuthError("Server error during registration.");
    }
  };

  const pct = result ? Math.round(result.diabetes_probability * 100) : 0;

  return (
    <div className="app-container">
      <div className="phone-frame">
        
        {/* Phone Header Bar */}
        <div className="phone-header">
          <div className="logo">Gluco<span>Check</span></div>
          <div className={"status-badge " + (online ? "on" : "")}>
            <i/> {online ? "Online" : "Offline"}
          </div>
        </div>

        {/* 1. WELCOME SCREEN */}
        {screen === "welcome" && (
          <div className="screen splash-screen">
            <div className="splash-icon">🧬</div>
            <h1>Understand diabetes risk in seconds.</h1>
            <p>Your AI-powered health screening assistant. Fast, secure, and built with your trained machine learning pipeline.</p>
            <div className="splash-actions">
              <button className="btn-primary" onClick={() => { setAuthError(""); setScreen("signup"); }}>
                Get Started →
              </button>
              <button className="btn-secondary" onClick={() => { setAuthError(""); setScreen("login"); }}>
                I already have an account
              </button>
            </div>
            <span className="disclaimer-text">Educational screening tool — not medical advice</span>
          </div>
        )}

        {/* 2. LOGIN SCREEN */}
        {screen === "login" && (
          <div className="screen auth-screen">
            <div className="auth-header-row">
              <button className="back-link" onClick={() => setScreen("welcome")}>← Back</button>
            </div>
            <div className="auth-header">
              <h2>Welcome Back!</h2>
              <p>Log in to your GlucoCheck profile</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <GoogleLogin
                onSuccess={async credentialResponse => {
                  try {
                    const res = await fetch("http://localhost:5001/api/auth/google", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token: credentialResponse.credential })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setCurrentUser({ name: data.user.username, email: data.user.email });
                      setScreen("dashboard");
                    } else {
                      setAuthError(data.error || "Google login failed");
                    }
                  } catch (err) {
                    console.error("Google auth error:", err);
                    setAuthError("Server error during Google login");
                  }
                }}
                onError={() => {
                  setAuthError("Google Login Failed");
                }}
              />
            </div>

            <div className="divider"><span>OR</span></div>

            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                <span>Email address</span>
                <input type="email" placeholder="name@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="off" required />
              </label>
              <label>
                <span>Password</span>
                <input type="password" placeholder="••••••••" value={loginPass} onChange={e => setLoginPass(e.target.value)} autoComplete="new-password" required />
              </label>
              <div className="forgot-pass">Forgot Password?</div>
              {authError && <div className="error-box">{authError}</div>}
              <button type="submit" className="btn-primary" style={{marginTop: "12px"}}>Log In</button>
            </form>

            <div className="auth-switch">
              <p>Don't have an account? <span onClick={() => { setAuthError(""); setScreen("signup"); }}>Sign Up</span></p>
            </div>
          </div>
        )}

        {/* 3. SIGNUP SCREEN */}
        {screen === "signup" && (
          <div className="screen auth-screen">
            <div className="auth-header-row">
              <button className="back-link" onClick={() => setScreen("welcome")}>← Back</button>
            </div>
            <div className="auth-header">
              <h2>Create an Account</h2>
              <p>Sign up to run diabetes risk assessments</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <GoogleLogin
                onSuccess={async credentialResponse => {
                  try {
                    const res = await fetch("http://localhost:5001/api/auth/google", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token: credentialResponse.credential })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setCurrentUser({ name: data.user.username, email: data.user.email });
                      setScreen("dashboard");
                    } else {
                      setAuthError(data.error || "Google signup failed");
                    }
                  } catch (err) {
                    console.error("Google auth error:", err);
                    setAuthError("Server error during Google signup");
                  }
                }}
                onError={() => {
                  setAuthError("Google Signup Failed");
                }}
              />
            </div>

            <div className="divider"><span>OR</span></div>

            <form className="auth-form" onSubmit={handleSignup}>
              <label>
                <span>Username</span>
                <input type="text" placeholder="Enter username" value={signupName} onChange={e => setSignupName(e.target.value)} autoComplete="off" required />
              </label>
              <label>
                <span>Email address</span>
                <input type="email" placeholder="name@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} autoComplete="off" required />
              </label>
              <label>
                <span>Password (Strong)</span>
                <input type="password" placeholder="Min 8 chars, @$!%*?&" value={signupPass} onChange={e => setSignupPass(e.target.value)} autoComplete="new-password" required />
              </label>
              {authError && <div className="error-box">{authError}</div>}
              <button type="submit" className="btn-primary" style={{marginTop: "12px"}}>Create Account</button>
            </form>

            <div className="auth-switch">
              <p>Already have an account? <span onClick={() => { setAuthError(""); setScreen("login"); }}>Log In</span></p>
            </div>
          </div>
        )}

        {/* 4. DASHBOARD SCREEN */}
        {screen === "dashboard" && (
          <div className="screen dashboard-screen">
            <div className="dash-top">
              <div>
                <small>Welcome back,</small>
                <h3>{currentUser?.name || "User"}</h3>
              </div>
              <button className="btn-logout" onClick={() => { setCurrentUser(null); setScreen("welcome"); }}>Logout</button>
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
                    <span>MODEL RESULT</span>
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