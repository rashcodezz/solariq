import { useState } from "react";

export default function WeatherForm({ onSubmit }) {
  const [form, setForm] = useState({
    roofArea: "",
    efficiency: "0.18",
    tariff: "8",
    systemCost: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      roofArea: parseFloat(form.roofArea),
      efficiency: parseFloat(form.efficiency),
      tariff: parseFloat(form.tariff),
      systemCost: parseFloat(form.systemCost),
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3 className="section-title">Rooftop & Cost</h3>

      <div className="form-row">
        <label>Roof Area (m²)</label>
        <input
          name="roofArea"
          value={form.roofArea}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <label>Panel Efficiency</label>
        <input
          name="efficiency"
          value={form.efficiency}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>Tariff (₹/kWh)</label>
        <input
          name="tariff"
          value={form.tariff}
          onChange={handleChange}
        />
      </div>

      <div className="form-row">
        <label>System Cost (₹)</label>
        <input
          name="systemCost"
          value={form.systemCost}
          onChange={handleChange}
          required
        />
      </div>

      <button className="primary-button" type="submit">
        Predict from Location
      </button>
    </form>
  );
}
