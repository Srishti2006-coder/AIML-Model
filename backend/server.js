import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import User from "./models/User.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const ML_API = "http://127.0.0.1:5000";
const GOOGLE_CLIENT_ID = "721271308120-ukjpt2eds5amh5d5mkd05ok42fbcg77.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas Successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.json({ message: "Diabetes Prediction Backend is running with MongoDB!" });
});

app.get("/api/health", async (req, res) => {
  try {
    const response = await fetch(`${ML_API}/health`);
    const data = await response.json();
    res.json({ 
      backend: "ok", 
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected", 
      mlApi: data 
    });
  } catch {
    res.status(503).json({ 
      backend: "ok", 
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected", 
      mlApi: "offline" 
    });
  }
});

// --- AUTHENTICATION ROUTES ---

// Signup Route
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: { username, email } });
  } catch (err) {
    console.error("EXACT SIGNUP ERROR:", err);
    res.status(500).json({ error: err.message || "Server error during registration." });
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.0; // Wait, let's keep it proper:
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    res.json({ message: "Login successful", user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Server error during login." });
  }
});

// Google Authentication Route
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { name, email } = ticket.getPayload();

    // Check if user already exists in database, if not create one automatically
    let user = await User.findOne({ email });
    if (!user) {
      // Create a random secure password for Google users since password is required in schema
      const randomPassword = Math.random().toString(36).slice(-8) + "Aa1@";
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = new User({ username: name, email, password: hashedPassword });
      await user.save();
    }

    res.status(200).json({ 
      message: "Google Authentication Successful", 
      user: { username: user.username, email: user.email } 
    });
  } catch (err) {
    console.error("Google auth verification error:", err);
    res.status(400).json({ error: "Google authentication failed." });
  }
});

// --- PREDICTION ROUTE ---
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