from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

model = joblib.load("random_forest_model.pkl")
scaler = joblib.load("scaler.pkl")
selector = joblib.load("selector.pkl")

FEATURES = [
    "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
    "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
]

@app.route("/")
def home():
    return "Diabetes Prediction API is running!"

@app.route("/health")
def health():
    return jsonify({"status": "ok", "model": "Random Forest"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received."}), 400

        missing = [f for f in FEATURES if f not in data]
        if missing:
            return jsonify({"error": "Missing required fields.", "missing": missing}), 400

        values = [float(data[f]) for f in FEATURES]
        if not np.all(np.isfinite(values)):
            return jsonify({"error": "All values must be valid numbers."}), 400

        patient = np.array([values], dtype=float)
        patient_scaled = scaler.transform(patient)
        patient_selected = selector.transform(patient_scaled)

        prediction = int(model.predict(patient_selected)[0])
        probability = float(model.predict_proba(patient_selected)[0][1])

        return jsonify({
            "prediction": prediction,
            "label": "Higher diabetes risk" if prediction == 1 else "Lower diabetes risk",
            "diabetes_probability": round(probability, 4),
            "selected_features": ["Glucose", "SkinThickness", "Insulin", "BMI", "Age"]
        })
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
