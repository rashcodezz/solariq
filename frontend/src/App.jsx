import { useState } from "react";
import MapComponent from "./MapComponent";
import WeatherForm from "./WeatherForm";
import "./App.css";

function App() {
  const [location, setLocation] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [economics, setEconomics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const handleWeatherSubmit = async (params) => {
  if (!location) {
    alert("Please click on the map to select a location first.");
    return;
  }

  setLoading(true);
  setError("");
  setPrediction(null);
  setEconomics(null);

  try {
    // 1) get radiation from backend using lat/lng
    const res = await fetch("http://127.0.0.1:5000/api/predict_from_location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: location.lat, lng: location.lng }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }

    setPrediction(data);

    // 2) use radiation + user rooftop params to compute energy & savings
    const annualRad = data.annual_radiation_kwh_m2;
    const { roofArea, efficiency, tariff, systemCost } = params;

    const annualEnergyKwh = annualRad * roofArea * efficiency;
    const annualSavings = annualEnergyKwh * tariff;
    const paybackYears =
      annualSavings > 0 ? systemCost / annualSavings : null;
    const co2SavedKg = annualEnergyKwh * 0.7;

    setEconomics({
      annualRad,
      annualEnergyKwh,
      annualSavings,
      paybackYears,
      co2SavedKg,
    });
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Solar Potential Explorer</h1>
        <p className="app-subtitle">
          Click on the map, enter local conditions, and estimate rooftop solar output,
          savings, and payback.
        </p>
      </header>

      <main className="app-layout">
        <section className="map-panel card">
          <h2 className="card-title">Select Location</h2>
          <MapComponent
            onLocationSelect={(latlng) => {
              setLocation(latlng);
            }}
          />
          {location && (
            <p className="location-text">
              Selected: <span>{location.lat.toFixed(4)}</span>,{" "}
              <span>{location.lng.toFixed(4)}</span>
            </p>
          )}
        </section>

        <section className="side-panel">
          <div className="card">
            <h2 className="card-title">Inputs</h2>
            <WeatherForm onSubmit={handleWeatherSubmit} />
          </div>

          {loading && <p className="info-text">Calculating prediction…</p>}
          {error && <p className="error-text">Error: {error}</p>}

          {prediction && (
            <div className="card">
              <h2 className="card-title">Radiation Prediction</h2>
              <p className="metric">
                <span>Instant Radiation</span>
                <strong>{prediction.predicted_radiation.toFixed(2)}</strong>
              </p>
              <p className="metric metric-muted">
                Model output in dataset units (approx W/m²).
              </p>
            </div>
          )}

          {economics && (
            <div className="card card-highlight">
              <h2 className="card-title">Energy & Savings</h2>
              <p className="metric">
                <span>Annual Radiation</span>
                <strong>
                  {economics.annualRad.toFixed(2)} kWh/m² / year
                </strong>
              </p>
              <p className="metric">
                <span>Annual Energy</span>
                <strong>{economics.annualEnergyKwh.toFixed(2)} kWh</strong>
              </p>
              <p className="metric">
                <span>Annual Savings</span>
                <strong>₹ {economics.annualSavings.toFixed(0)}</strong>
              </p>
              <p className="metric">
                <span>Payback Period</span>
                <strong>
                  {economics.paybackYears
                    ? `${economics.paybackYears.toFixed(1)} years`
                    : "N/A"}
                </strong>
              </p>
              <p className="metric">
                <span>CO₂ Saved</span>
                <strong>{economics.co2SavedKg.toFixed(0)} kg / year</strong>
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
