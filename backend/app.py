import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# ==============================
#  LOAD MODEL + FEATURE NAMES
# ==============================
MODEL_PATH = "solar_model.pkl"
FEATURES_PATH = "solar_features.pkl"

try:
    model = joblib.load(MODEL_PATH)
    EXPECTED_FEATURES = joblib.load(FEATURES_PATH)
    print("✅ Loaded model and features from disk.")
except Exception as e:
    print("❌ Error loading model or features:", e)
    model = None
    EXPECTED_FEATURES = None
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

def fetch_weather_from_latlon(lat: float, lon: float):
    """
    Fetch current weather for the given lat/lon from OpenWeather,
    and convert units to match the training dataset:
      - temp: °C -> °F
      - pressure: hPa -> inHg
      - speed: m/s -> mph
    """
    if not OPENWEATHER_API_KEY:
        raise RuntimeError("OPENWEATHER_API_KEY is not set")

    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    )

    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    temp_c = data["main"]["temp"]
    pressure_hpa = data["main"]["pressure"]
    humidity = data["main"]["humidity"]
    wind_speed_ms = data["wind"].get("speed", 0.0)
    wind_dir_deg = data["wind"].get("deg", 0.0)
    unixtime = data["dt"]

    # convert units
    temp_f = temp_c * 9 / 5 + 32
    pressure_inhg = pressure_hpa * 0.0295299830714
    speed_mph = wind_speed_ms * 2.23693629

    return {
        "unixtime": unixtime,
        "temperature": temp_f,
        "pressure": pressure_inhg,
        "humidity": humidity,
        "wind_direction_degrees": wind_dir_deg,
        "speed": speed_mph,
    }


@app.route("/api/health", methods=["GET"])
def health():
    return {"status": "ok"}


def build_input_dataframe(payload: dict) -> pd.DataFrame:
    """
    payload keys expected:
    - unixtime
    - temperature (F)
    - pressure (inHg)
    - humidity (%)
    - wind_direction_degrees (°)
    - speed (mph)
    """
    input_dict = {
        "UNIXTime": float(payload["unixtime"]),
        "Temperature": float(payload["temperature"]),
        "Pressure": float(payload["pressure"]),
        "Humidity": float(payload["humidity"]),
        "WindDirection(Degrees)": float(payload["wind_direction_degrees"]),
        "Speed": float(payload["speed"]),
    }

    row = {feat: input_dict[feat] for feat in EXPECTED_FEATURES}
    return pd.DataFrame([row])

@app.route("/api/predict_from_location", methods=["POST"])
def predict_from_location():
    """
    Body: { "lat": ..., "lng": ... }

    1. Fetch live weather for that location
    2. Build feature row
    3. Run ML model
    4. Return radiation + annual kWh/m²
    """
    if model is None or EXPECTED_FEATURES is None:
        return jsonify({"error": "Model not loaded on server."}), 500

    data = request.get_json() or {}

    try:
        lat = float(data["lat"])
        lng = float(data["lng"])
    except KeyError as e:
        return jsonify({"error": f"Missing field {e}"}), 400

    try:
        weather = fetch_weather_from_latlon(lat, lng)

        input_df = build_input_dataframe(weather)
        radiation = float(model.predict(input_df)[0])

        PEAK_SUN_HOURS = 5
        annual_kwh_m2 = radiation * PEAK_SUN_HOURS * 365 / 1000.0

        return jsonify({
            "lat": lat,
            "lng": lng,
            "weather_used": weather,
            "predicted_radiation": radiation,
            "annual_radiation_kwh_m2": annual_kwh_m2
        })
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {e}"}), 500


@app.route("/api/predict_radiation", methods=["POST"])
def predict_radiation():
    if model is None or EXPECTED_FEATURES is None:
        return jsonify({"error": "Model not loaded on server."}), 500

    data = request.get_json() or {}

    try:
        # Build DataFrame in correct format
        input_df = build_input_dataframe(data)

        # Model prediction (same units as in your dataset's 'Radiation' column)
        radiation = float(model.predict(input_df)[0])

        # Optional: very rough conversion to annual kWh/m^2
        # (This is just a placeholder; you can refine later)
        annual_kwh_m2 = radiation * 24 * 365 / 1000.0

        return jsonify({
            "predicted_radiation": radiation,
            "annual_radiation_kwh_m2": annual_kwh_m2
        })

    except KeyError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {e}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
