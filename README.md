# Diabetes Prediction System

React + Vite frontend, Node + Express backend, and Python + Flask ML API.

Copy these three trained files from your existing ml_model folder into this project's ml_model folder:
- random_forest_model.pkl
- scaler.pkl
- selector.pkl

Run:
1. In ml_model: pip install flask joblib scikit-learn numpy pandas && python app.py
2. In backend: npm install && npm run dev
3. In frontend: npm install && npm run dev

The React form sends all 8 original features. Flask applies the saved scaler, SelectKBest selector, and Random Forest model. Selected features are Glucose, SkinThickness, Insulin, BMI, Age.

Educational project only; not a medical diagnosis tool.
