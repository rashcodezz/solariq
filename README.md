SolarIQ – Location-Aware Solar Energy Estimation Platform

SolarIQ is a full-stack web application that estimates location-specific solar radiation, rooftop energy generation, financial savings, payback period, and CO₂ reduction using machine learning and real-time weather data.

🚀 Features

Interactive map-based location selection using Leaflet

Real-time weather integration via OpenWeather API

Machine Learning-based solar radiation prediction

Rooftop solar energy generation & financial feasibility analysis

Clean and responsive React frontend

Lightweight Flask REST API backend

🧠 Machine Learning Model

Algorithm: Gradient Boosting Regressor

Trained on a public Solar Prediction dataset

Input features:

UNIX Time

Temperature

Pressure

Humidity

Wind Direction

Wind Speed

Output:

Instantaneous solar radiation (W/m²)

Model performance:

R² score ≈ 0.84 on unseen test data

🏗️ System Architecture
User → React + Leaflet UI
     → Flask REST API
     → OpenWeather API (real-time weather)
     → ML Model (radiation prediction)
     → Energy, Savings & Payback Calculation
     → Results displayed on UI

🧩 Tech Stack
Frontend

React (Vite)

JavaScript (ES6)

Leaflet / React-Leaflet

HTML, CSS

Backend

Python

Flask

REST APIs

joblib

requests

Machine Learning

Scikit-learn

Pandas

NumPy

Gradient Boosting Regressor

APIs

OpenWeather API (real-time weather data)

NASA POWER API (used for evaluation & validation)

📊 Calculations Used

Annual Radiation (kWh/m²/year)

Radiation × Peak Sun Hours × 365


Annual Energy Generation (kWh)

Annual Radiation × Roof Area × Panel Efficiency


Annual Savings (₹)

Annual Energy × Electricity Tariff


Payback Period (years)

System Cost / Annual Savings


CO₂ Reduction

Annual Energy × 0.7 kg CO₂ per kWh

⚙️ Setup Instructions
Backend
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python app.py

Frontend
cd frontend
npm install
npm run dev


Backend runs on: http://127.0.0.1:5000
Frontend runs on: http://localhost:5173

🔑 Environment Variables

Create an environment variable for OpenWeather API:

OPENWEATHER_API_KEY=your_api_key_here

⚠️ Limitations

Model trained on data from a single climatic region

Slight overestimation in highly humid coastal areas

No seasonal or cloud index included in the ML model

🔮 Future Enhancements

Multi-location global training using NASA POWER data

Cloud index & seasonal features

Automatic rooftop area estimation

PDF solar feasibility report generation

Cloud deployment (Netlify + Render)

📌 Project Motivation

The project aims to bridge the gap between raw solar radiation data and practical rooftop solar investment decisions by combining machine learning, real-time weather, and geospatial interaction.

👨‍💻 Author

Sama Rashmika Reddy
B.Tech – Computer Science (AI/ML)
📍 India

⭐ Acknowledgements

OpenWeather API

NASA POWER Project

Scikit-learn community
