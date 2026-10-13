import express from "express";
import cors from "cors";

const app = express();
const PORT = 5001;
const ML_API = "http://127.0.0.1:5000";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Diabetes Prediction Backend is running!" });
});

app.get("/api/health", async (req, res) => {
  try {
    const response = await fetch(`${ML_API}/health`);
    const data = await response.json();
    res.json({ backend: "ok", mlApi: data });
  } catch {
    res.status(503).json({ backend: "ok", mlApi: "offline" });
  }
});

app.post("/api/predict", async (req, res) => {
  try {
    const response = await fetch(`${ML_API}/predict`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch {
    res.status(503).json({
      error: "ML service unavailable. Start Flask on port 5000."
    });
  }
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
