# AI Environmental Monitoring Network (SIH26178)
### Real-Time Environmental Intelligence & Early Warning System (Phase 1)

Distributed IoT environmental monitoring and AI early warning system for **Forest Fire**, **Flood**, and **Pollution** hazard mitigation.

Phase 1 features a **hardware-decoupled software architecture** with a stable API contract. The `mock_sensor.py` simulator generates real-time telemetry matching the future ESP32 contract, feeding the **FastAPI backend**, **PostgreSQL database**, **AI Risk Engine**, **WebSocket Hub**, and **React Command Center Dashboard**.

---

## 🏗 System Architecture

```
[ Mock Sensor Generator / Future ESP32 ]
                     │  (POST /api/sensor-data)
                     ▼
         [ FastAPI REST & WebSocket ]
           ├── Ingestion Pipeline
           ├── Liveness Monitor (Online/Offline)
           └── Real-time Broadcast (/ws/dashboard)
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
 [ PostgreSQL / SQLite ]  [ AI Risk Engine ]
  - sensor_nodes           - Fire Risk (0-100)
  - sensor_readings        - Flood Risk (0-100)
  - risk_predictions       - Pollution Risk (0-100)
  - alerts                 - Overall Composite
         │                       │
         └───────────┬───────────┘
                     ▼
       [ React Command Center Dashboard ]
        - Geospatial Leaflet Map
        - Real-Time Hazard Cards & Gauges
        - Live Sensor Telemetry Metrics
        - Recharts Historical Analysis
        - Active Alert Stream & Acknowledge
        - Fleet Diagnostics & Health
```

---

## 🔌 ESP32 API Contract (Stable)

When physical ESP32 hardware is deployed, it communicates with the exact same endpoint and JSON schema:

### Endpoint:
```http
POST /api/sensor-data
Content-Type: application/json
```

### Expected JSON Payload:
```json
{
  "node_id": "ENV-001",
  "temperature": 32.4,
  "humidity": 58.2,
  "pressure": 1008.5,
  "rain_value": 420.0,
  "air_quality": 315.0,
  "latitude": 25.2138,
  "longitude": 75.8648,
  "battery_percentage": 87.0,
  "timestamp": "2026-09-08T21:30:00"
}
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (or `uv` package manager)
- **Node.js 18+** & `npm`
- **PostgreSQL** (Optional — automatic zero-config SQLite fallback is built-in)

---

### Step 1: PostgreSQL Setup (Optional)
If using PostgreSQL:
```sql
CREATE DATABASE environment_monitoring;
```
Configure `backend/.env`:
```ini
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/environment_monitoring
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
NODE_OFFLINE_THRESHOLD_SECONDS=30
ALERT_COOLDOWN_SECONDS=30
DEMO_MODE=true
```
*(If PostgreSQL is not running, the backend automatically uses `sqlite:///./environment_monitoring.db` with zero configuration).*

---

### Step 2: Backend Setup & Startup (Terminal 1)
```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- WebSocket Endpoint: `ws://localhost:8000/ws/dashboard`

---

### Step 3: Frontend Setup & Startup (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
- Open Dashboard: [http://localhost:5173](http://localhost:5173)

---

### Step 4: Mock Sensor Telemetry (Terminal 3)

#### Normal Multi-Node Simulation:
```bash
python mock_sensor.py
```
*Simulates all 5 sensor nodes (`ENV-001` through `ENV-005`) broadcasting realistic environmental variations every 5 seconds.*

---

## 🎯 Demo Hazard Scenarios

Run demo hazard simulations to test the AI risk engine, alert engine, and real-time dashboard triggers:

### 1. Forest Fire Scenario (Targeting `ENV-003`)
```bash
python mock_sensor.py --scenario fire --node ENV-003
```
*Simulates thermal surge, rapid humidity depletion, and combustion gas spikes. Triggers **CRITICAL Fire Hazard** alerts.*

### 2. Flood & Rain Surge Scenario (Targeting `ENV-002`)
```bash
python mock_sensor.py --scenario flood --node ENV-002
```
*Simulates intense precipitation inflow, barometric pressure drop, and moisture saturation. Triggers **Flood Hazard** alerts.*

### 3. Air Pollution & Toxic Inversion Scenario (Targeting `ENV-004`)
```bash
python mock_sensor.py --scenario pollution --node ENV-004
```
*Simulates particulate/VOC concentration accumulation and atmospheric trapping. Triggers **Pollution Hazard** alerts.*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sensor-data` | Ingests sensor reading, runs risk engine, generates alerts, broadcasts to WebSocket |
| `GET` | `/api/nodes` | Returns all registered sensor nodes, latest reading, risk score & sensor health |
| `GET` | `/api/nodes/{node_id}` | Returns single node detailed telemetry, specs & diagnostics |
| `GET` | `/api/latest-readings` | Returns the latest reading for all nodes in the fleet |
| `GET` | `/api/readings/{node_id}` | Returns historical time-series telemetry with time/limit filters |
| `GET` | `/api/risk/{node_id}` | Returns current Fire, Flood, and Pollution risk scores |
| `GET` | `/api/alerts` | Returns alert stream with filtering by severity, risk type, and acknowledgment |
| `POST` | `/api/alerts/{alert_id}/acknowledge` | Marks an alert as acknowledged by the operator |
| `GET` | `/api/dashboard/summary` | Returns aggregated KPI counts and fleet environmental averages |
| `WS` | `/ws/dashboard` | WebSocket live stream for instant telemetry and alert broadcast |

---

## 🧠 AI Risk Engine Modular Architecture

The risk engine (`backend/risk_engine.py`) exposes modular calculation methods:
- `calculate_fire_risk(temp, hum, aqi, pressure, recent_readings)`
- `calculate_flood_risk(rain, hum, pressure, recent_readings)`
- `calculate_pollution_risk(aqi, temp, hum, recent_readings)`
- `calculate_overall_risk(fire, flood, poll)`

### Risk Categories:
- `0 - 25`: **LOW**
- `26 - 50`: **MODERATE**
- `51 - 75`: **HIGH**
- `76 - 100`: **CRITICAL**

*Architecture Ready for Phase 2: Methods can be swapped directly with trained `XGBoost` or `RandomForest` `.predict()` pipelines without modifying database schemas or frontend components.*

---

## 🛠 Future ESP32 Hardware Integration

In Phase 2, when physical ESP32 nodes are deployed:
1. Flash ESP32 firmware with Wi-Fi HTTP client library.
2. Configure Wi-Fi SSID and password.
3. Configure `NODE_ID` (e.g. `ENV-001`) and `API_URL` (`http://<BACKEND_IP>:8000/api/sensor-data`).
4. Connect DHT22/BME280 (Temp/Hum/Pressure), MQ-135/PMS5003 (Air Quality/Gas), Rain sensor, and GPS module.
5. Power on node — telemetry will automatically appear on the React dashboard in real time. No dashboard or backend redesign required.
