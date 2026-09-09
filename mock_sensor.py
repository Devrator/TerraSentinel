#!/usr/bin/env python3
"""
AI Environmental Monitoring Network (SIH26178) - Mock Sensor Generator
Simulates distributed ESP32 IoT nodes sending telemetry to the FastAPI backend.
"""

import time
import json
import random
import argparse
import sys
from datetime import datetime, timezone
import requests

# Ensure UTF-8 output stream on Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Base node profiles and initial physical coordinates
BASE_NODES = {
    "ENV-001": {
        "name": "North Valley Ridge Station",
        "latitude": 25.2138,
        "longitude": 75.8648,
        "base_temp": 31.5,
        "base_humidity": 52.0,
        "base_pressure": 1012.0,
        "base_rain": 0.0,
        "base_aqi": 85.0,
        "battery": 98.0,
    },
    "ENV-002": {
        "name": "River Basin Wetlands Sentinel",
        "latitude": 25.1845,
        "longitude": 75.8392,
        "base_temp": 28.0,
        "base_humidity": 72.0,
        "base_pressure": 1009.0,
        "base_rain": 25.0,
        "base_aqi": 60.0,
        "battery": 94.5,
    },
    "ENV-003": {
        "name": "Dense Pine Forest Canopy Node",
        "latitude": 25.2391,
        "longitude": 75.8924,
        "base_temp": 30.0,
        "base_humidity": 48.0,
        "base_pressure": 1014.0,
        "base_rain": 0.0,
        "base_aqi": 75.0,
        "battery": 87.0,
    },
    "ENV-004": {
        "name": "Industrial Perimeter Air Watch",
        "latitude": 25.1610,
        "longitude": 75.8510,
        "base_temp": 33.0,
        "base_humidity": 45.0,
        "base_pressure": 1011.0,
        "base_rain": 0.0,
        "base_aqi": 160.0,
        "battery": 92.0,
    },
    "ENV-005": {
        "name": "Southern Hills Watershed Node",
        "latitude": 25.1432,
        "longitude": 75.8789,
        "base_temp": 29.5,
        "base_humidity": 65.0,
        "base_pressure": 1010.5,
        "base_rain": 10.0,
        "base_aqi": 70.0,
        "battery": 89.0,
    },
}

class NodeSimulator:
    def __init__(self, node_id: str, profile: dict):
        self.node_id = node_id
        self.latitude = profile["latitude"]
        self.longitude = profile["longitude"]
        self.temp = profile["base_temp"]
        self.humidity = profile["base_humidity"]
        self.pressure = profile["base_pressure"]
        self.rain = profile["base_rain"]
        self.aqi = profile["base_aqi"]
        self.battery = profile["battery"]
        self.step_count = 0

    def step_normal(self):
        """Simulate realistic continuous environmental Brownian drift"""
        # Gradual temperature drift (±0.3 °C) bounded between 20 and 42
        self.temp = max(20.0, min(45.0, self.temp + random.uniform(-0.3, 0.3)))
        
        # Humidity inversely correlated with temp
        hum_delta = -0.6 * (self.temp - 30.0) * 0.2 + random.uniform(-0.5, 0.5)
        self.humidity = max(15.0, min(92.0, self.humidity + hum_delta))
        
        # Pressure drift (±0.2 hPa) bounded between 995 and 1025
        self.pressure = max(990.0, min(1030.0, self.pressure + random.uniform(-0.2, 0.2)))
        
        # Rain value baseline
        self.rain = max(0.0, min(100.0, self.rain + random.uniform(-2.0, 2.0)))
        
        # Air quality index baseline drift
        self.aqi = max(30.0, min(220.0, self.aqi + random.uniform(-1.5, 1.5)))
        
        # Battery slowly discharges
        self.battery = max(2.0, self.battery - 0.005)
        self.step_count += 1

    def step_fire_hazard(self):
        """Simulate rapid wildfire conditions progression"""
        self.temp = min(48.5, self.temp + random.uniform(0.6, 1.4))
        self.humidity = max(8.0, self.humidity - random.uniform(1.0, 2.5))
        self.aqi = min(460.0, self.aqi + random.uniform(8.0, 18.0))
        self.pressure = min(1022.0, self.pressure + random.uniform(0.1, 0.4))
        self.rain = 0.0
        self.battery = max(2.0, self.battery - 0.01)
        self.step_count += 1

    def step_flood_hazard(self):
        """Simulate heavy storm & flood hazard progression"""
        self.rain = min(920.0, self.rain + random.uniform(25.0, 50.0))
        self.humidity = min(99.0, self.humidity + random.uniform(0.8, 2.0))
        self.pressure = max(975.0, self.pressure - random.uniform(0.5, 1.2)) # Barometric depression
        self.temp = max(19.0, self.temp - random.uniform(0.2, 0.6))
        self.battery = max(2.0, self.battery - 0.01)
        self.step_count += 1

    def step_pollution_hazard(self):
        """Simulate severe hazardous air pollution spike"""
        self.aqi = min(480.0, self.aqi + random.uniform(12.0, 25.0))
        self.humidity = min(88.0, self.humidity + random.uniform(0.3, 1.0)) # Trapping humidity
        self.temp = max(18.0, min(32.0, self.temp + random.uniform(-0.2, 0.2)))
        self.battery = max(2.0, self.battery - 0.005)
        self.step_count += 1

    def get_payload(self) -> dict:
        # Micro-jitter GPS for live sensor realism (+/- 0.00005)
        jitter_lat = self.latitude + random.uniform(-0.00004, 0.00004)
        jitter_lon = self.longitude + random.uniform(-0.00004, 0.00004)

        return {
            "node_id": self.node_id,
            "temperature": round(self.temp, 1),
            "humidity": round(self.humidity, 1),
            "pressure": round(self.pressure, 1),
            "rain_value": round(self.rain, 1),
            "air_quality": round(self.aqi, 1),
            "latitude": round(jitter_lat, 6),
            "longitude": round(jitter_lon, 6),
            "battery_percentage": round(self.battery, 1),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

def run_simulation(api_url: str, scenario: str, target_node: str, interval: float, count: int = 0):
    print("=" * 70, flush=True)
    print("  AI ENVIRONMENTAL MONITORING NETWORK (SIH26178) - MOCK SENSOR", flush=True)
    print("=" * 70, flush=True)
    print(f"Target API Endpoint : {api_url}", flush=True)
    print(f"Active Scenario     : {scenario.upper()} (Prototype Risk Simulation)", flush=True)
    if scenario.lower() != "normal":
        print(f"Hazard Target Node  : {target_node}", flush=True)
    print(f"Broadcast Interval  : {interval}s", flush=True)
    print(f"Total Active Nodes  : {len(BASE_NODES)} ({', '.join(BASE_NODES.keys())})", flush=True)
    print("=" * 70, flush=True)
    print("Press Ctrl+C to gracefully stop simulation.\n", flush=True)

    simulators = {
        node_id: NodeSimulator(node_id, profile)
        for node_id, profile in BASE_NODES.items()
    }

    iteration = 0
    try:
        while True:
            iteration += 1
            timestamp_str = datetime.now().strftime("%H:%M:%S")
            print(f"--- [Cycle #{iteration} @ {timestamp_str}] Broadcasting Telemetry ---", flush=True)

            for node_id, sim in simulators.items():
                # Apply scenario step
                if scenario.lower() == "fire" and node_id == target_node:
                    sim.step_fire_hazard()
                elif scenario.lower() == "flood" and node_id == target_node:
                    sim.step_flood_hazard()
                elif scenario.lower() == "pollution" and node_id == target_node:
                    sim.step_pollution_hazard()
                else:
                    sim.step_normal()

                payload = sim.get_payload()

                try:
                    res = requests.post(api_url, json=payload, timeout=3.0)
                    if res.status_code == 200:
                        data = res.json()
                        risk_info = data.get("risk", {})
                        overall = risk_info.get("overall_risk", 0.0)
                        cat = risk_info.get("overall_category", "LOW")

                        alert_tag = f" [! {data.get('alerts_generated')} ALERT(S)]" if data.get("alerts_generated") else ""

                        print(
                            f"  [{node_id}] Temp: {payload['temperature']}°C | "
                            f"Hum: {payload['humidity']}% | "
                            f"Rain: {payload['rain_value']} | "
                            f"AQI: {payload['air_quality']} | "
                            f"Risk: {overall}% ({cat}){alert_tag}",
                            flush=True
                        )
                    else:
                        print(f"  [{node_id}] [WARN] Server responded with HTTP {res.status_code}: {res.text}", flush=True)
                except requests.exceptions.ConnectionError:
                    print(f"  [{node_id}] [ERROR] Connection Failed: Is FastAPI backend running at {api_url}?", flush=True)
                except Exception as ex:
                    print(f"  [{node_id}] [ERROR] Ingestion error: {ex}", flush=True)

            print("", flush=True)
            if count > 0 and iteration >= count:
                break
            time.sleep(interval)

    except KeyboardInterrupt:
        print("\n[Mock Sensor] Simulation stopped by operator.", flush=True)

def main():
    parser = argparse.ArgumentParser(description="Mock ESP32 Sensor Telemetry Generator for SIH26178")
    parser.add_argument(
        "--scenario",
        type=str,
        choices=["normal", "fire", "flood", "pollution"],
        default="normal",
        help="Demo hazard scenario to simulate (normal, fire, flood, pollution)"
    )
    parser.add_argument(
        "--node",
        type=str,
        default="ENV-003",
        help="Node ID to target with the hazard scenario (default: ENV-003)"
    )
    parser.add_argument(
        "--api-url",
        type=str,
        default="http://127.0.0.1:8000/api/sensor-data",
        help="Backend sensor ingestion API endpoint"
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=5.0,
        help="Broadcast interval in seconds (default: 5.0)"
    )
    parser.add_argument(
        "--count",
        type=int,
        default=0,
        help="Number of cycles to run (0 = run forever)"
    )

    args = parser.parse_args()
    run_simulation(
        api_url=args.api_url,
        scenario=args.scenario,
        target_node=args.node.upper(),
        interval=args.interval,
        count=args.count
    )

if __name__ == "__main__":
    main()
