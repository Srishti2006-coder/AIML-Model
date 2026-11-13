
import { useEffect, useState } from "react";
import "./ModelDetails.css";

const API = "http://localhost:5001";

const models = [
  { name: "Logistic Regression", short: "LR", accuracy: 75 },
  { name: "K-Nearest Neighbors", short: "KNN", accuracy: 81 },
  { name: "Decision Tree", short: "DT", accuracy: 87 },
  { name: "Random Forest", short: "RF", accuracy: 87 }
];

const features = [
  { name: "Glucose", icon: "◉" },
  { name: "Skin Thickness", icon: "◈" },
  { name: "Insulin", icon: "⌁" },
  { name: "BMI", icon: "◇" },
  { name: "Age", icon: "◷" }
];

export default function ModelDetails() {
  const [online, setOnline] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedModel, setSelectedModel] = useState(3);

  useEffect(() => {
    let active = true;

    const checkAPI = () => {
      fetch(`${API}/api/health`)
        .then(res => {
          if (!res.ok) throw new Error("API unavailable");
          return res.json();
        })
        .then(() => {
          if (active) setOnline(true);
        })
        .catch(() => {
          if (active) setOnline(false);
        });
    };

    checkAPI();

    const timer = setInterval(checkAPI, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const selected = models[selectedModel];

  return (
    <div className="md-page">

      
      {/* HERO */}
      <section className="md-hero">
        <div className="hero-content">
          <span className="hero-label">MODEL & PROJECT OVERVIEW</span>
          <h1>
            Inside the <span>Random Forest</span> Pipeline
          </h1>
          <p>
            From health data to intelligent predictions.
          </p>

          <div className="hero-tags">
            <span>Machine Learning</span>
            <span>Feature Selection</span>
            <span>Classification</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-circle">
            <span>♥</span>
            <div className="pulse-line">〰</div>
          </div>
          <div className="hero-glucose">
            <small>GLUCOSE MONITOR</small>
            <strong>98</strong>
            <span>mg/dL</span>
          </div>
          <div className="hero-decoration">✦</div>
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="md-stats">

        <article className="stat-card">
          <div className="stat-top">
            <div className="stat-icon mint">▤</div>
            <span className="stat-symbol">↗</span>
          </div>
          <small>DATASET SIZE</small>
          <strong>768 <span>Rows</span></strong>
          <p>Pima Indians Diabetes</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div className="stat-icon blue">◈</div>
            <span className="stat-symbol">▥</span>
          </div>
          <small>INPUT FEATURES</small>
          <strong>08 <span>Inputs</span></strong>
          <p>Clinical measurements</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div className="stat-icon peach">★</div>
            <span className="stat-symbol">♛</span>
          </div>
          <small>BEST MODEL</small>
          <strong>87% <span>Accuracy</span></strong>
          <p>Random Forest</p>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <div className="stat-icon violet">ϟ</div>
            <span className="stat-symbol">◎</span>
          </div>
          <small>FEATURE SELECTION</small>
          <strong>05 <span>Selected</span></strong>
          <p>SelectKBest pipeline</p>
        </article>

      </section>

      {/* EXECUTION PIPELINE */}
      <section className="md-panel md-pipeline">
        <div className="md-section-head">
          <div>
            <span className="md-kicker">HOW IT WORKS</span>
            <h3>Model Execution Workflow</h3>
          </div>
          <span className="md-count">4 STAGES</span>
        </div>

        <div className="md-flow">

          <div className="flow-step">
            <div className="flow-icon">▤</div>
            <small>01</small>
            <strong>Health Inputs</strong>
            <span>8 Clinical Metrics</span>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <div className="flow-icon">⚙</div>
            <small>02</small>
            <strong>Preprocessing</strong>
            <span>StandardScaler</span>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <div className="flow-icon">◈</div>
            <small>03</small>
            <strong>Feature Selection</strong>
            <span>SelectKBest · Top 5</span>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-step active-step">
            <div className="flow-icon">✓</div>
            <small>04</small>
            <strong>Random Forest</strong>
            <span>Risk Prediction</span>
          </div>

        </div>
      </section>

      {/* LOWER DASHBOARD */}
      <section className="md-lower">

        {/* FEATURE HIGHLIGHTS */}
        <div className="md-panel feature-panel">
          <div className="md-section-head">
            <div>
              <span className="md-kicker">INPUT ANALYSIS</span>
              <h3>Selected Features</h3>
            </div>
            <div className="mini-icon">▦</div>
          </div>

          <div className="feature-list">
            {(showAll
              ? features.concat([
                  { name: "Pregnancies", icon: "♡" },
                  { name: "Blood Pressure", icon: "⌁" },
                  { name: "Pedigree Function", icon: "◉" }
                ])
              : features
            ).map((feature, index) => (
              <div className="feature-item" key={feature.name}>
                <span className="feature-icon">{feature.icon}</span>
                <span>{feature.name}</span>
                {index < 5 && <b>✓</b>}
              </div>
            ))}
          </div>

          <button
            className="feature-toggle"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show selected features ↑" : "+ View all 8 inputs ↓"}
          </button>
        </div>

        {/* MODEL COMPARISON */}
        <div className="md-panel model-panel">
          <div className="md-section-head">
            <div>
              <span className="md-kicker">PERFORMANCE</span>
              <h3>Models at a Glance</h3>
            </div>
            <div className="mini-icon">▥</div>
          </div>

          <div className="model-list">
            {models.map((model, index) => (
              <button
                key={model.short}
                className={`model-row ${selectedModel === index ? "model-selected" : ""}`}
                onClick={() => setSelectedModel(index)}
              >
                <span className="model-short">{model.short}</span>

                <span className="model-info">
                  <strong>{model.name}</strong>
                  <span className="model-track">
                    <span style={{ width: `${model.accuracy}%` }} />
                  </span>
                </span>

                <b className="model-percent">{model.accuracy}%</b>
              </button>
            ))}
          </div>

          <div className="model-result">
            <span>SELECTED MODEL</span>
            <strong>{selected.name}</strong>
            <b>{selected.accuracy}% Accuracy</b>
          </div>
        </div>

        {/* DATA FLOW */}
        <div className="md-panel data-panel">
          <div className="md-section-head">
            <div>
              <span className="md-kicker">UNDER THE HOOD</span>
              <h3>Pipeline Data Flow</h3>
            </div>
            <div className="mini-icon">⌁</div>
          </div>

          <div className="data-flow">
            <div className="data-node">
              <div className="data-icon">▤</div>
              <strong>Dataset</strong>
              <small>768 × 8</small>
            </div>

            <span className="data-arrow">→</span>

            <div className="data-node">
              <div className="data-icon">⚙</div>
              <strong>Scaler</strong>
              <small>Normalization</small>
            </div>

            <span className="data-arrow">→</span>

            <div className="data-node">
              <div className="data-icon">◈</div>
              <strong>SelectKBest</strong>
              <small>Top 5</small>
            </div>

            <span className="data-arrow">→</span>

            <div className="data-node final-node">
              <div className="data-icon">✓</div>
              <strong>Random Forest</strong>
              <small>87% Accuracy</small>
            </div>
          </div>

          <div className="data-footer">
            <span className="live-dot" />
            Saved model pipeline
          </div>
        </div>

      </section>

      {/* FOOTER */}
      <section className="md-footer">
        <div>
          <span className="footer-icon">✦</span>
          <div>
            <strong>Built with Machine Learning</strong>
            <p>Python · Scikit-learn · React · Node.js · MongoDB</p>
          </div>
        </div>

        <span className="footer-badge">GLUCOCHECK</span>
      </section>

    </div>
  );
}
