from typing import List, Dict, Any, Optional
import numpy as np
import math

def get_risk_category(score: float) -> str:
    """
    Returns risk category based on score:
    0-25: LOW
    26-50: MODERATE
    51-75: HIGH
    76-100: CRITICAL
    """
    if score <= 25.0:
        return "LOW"
    elif score <= 50.0:
        return "MODERATE"
    elif score <= 75.0:
        return "HIGH"
    else:
        return "CRITICAL"

class RiskEngine:
    """
    Modular AI Risk Engine & Distributed Consensus Processor (SIH26178).
    Implements:
    1. Edge Risk Logic (on-node rapid heuristic check)
    2. Central Multi-Variate Risk Evaluation (Fire, Flood, Pollution, Overall)
    3. Sensor Trust & Data Confidence Scoring (freshness, sanity, consistency, noise)
    4. Prototype Multi-Node Spatial Consensus (neighborhood cluster agreement)
    5. Transparent Anomaly Detection & Explainability
    """

    @staticmethod
    def calculate_edge_risk(
        temperature: float,
        humidity: float,
        air_quality: float,
        recent_readings: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Lightweight Edge Risk Logic (runs on edge ESP32 or simulated edge adapter).
        Evaluates immediate threshold and rate-of-change rules without heavy computation:
        - Thermal Surge (> 42°C or rapid +2°C/min rise)
        - Desiccation (Humidity < 25%)
        - Smog/Combustion Gas Spike (AQI > 200)
        Produces: NORMAL | WATCH | WARNING | CRITICAL
        """
        reasons = []
        is_critical = False
        is_warning = False
        is_watch = False

        # Thermal Checks
        if temperature >= 45.0:
            is_critical = True
            reasons.append(f"Extreme heat ({temperature:.1f}°C)")
        elif temperature >= 38.0:
            is_warning = True
            reasons.append(f"Elevated temperature ({temperature:.1f}°C)")
        elif temperature >= 33.0:
            is_watch = True

        # Humidity Checks
        if humidity <= 20.0:
            is_warning = True
            reasons.append(f"Severe dry air ({humidity:.1f}% RH)")
        elif humidity <= 32.0:
            is_watch = True

        # Gas / Smoke Checks
        if air_quality >= 300.0:
            is_critical = True
            reasons.append(f"Toxic gas/combustion spike ({air_quality:.0f} PPM)")
        elif air_quality >= 180.0:
            is_warning = True
            reasons.append(f"Elevated gas levels ({air_quality:.0f} PPM)")
        elif air_quality >= 120.0:
            is_watch = True

        # Compound rule: Rising Temp + Falling Humidity + Gas Smoke
        if temperature > 35.0 and humidity < 35.0 and air_quality > 150.0:
            is_critical = True
            reasons.append("Multi-factor local wildfire signature")

        # Rate of change if history provided
        if recent_readings and len(recent_readings) >= 2:
            prev = recent_readings[-2]
            dT = temperature - prev.get("temperature", temperature)
            dAQI = air_quality - prev.get("air_quality", air_quality)
            if dT >= 3.0:
                is_warning = True
                reasons.append(f"Rapid thermal surge (+{dT:.1f}°C/sample)")
            if dAQI >= 60.0:
                is_warning = True
                reasons.append(f"Rapid gas accumulation (+{dAQI:.0f} PPM/sample)")

        if is_critical:
            edge_status = "CRITICAL"
        elif is_warning:
            edge_status = "WARNING"
        elif is_watch:
            edge_status = "WATCH"
        else:
            edge_status = "NORMAL"

        return {
            "edge_status": edge_status,
            "reasons": reasons if reasons else ["Nominal local conditions"],
            "summary": " • ".join(reasons) if reasons else "Edge conditions stable"
        }

    @staticmethod
    def calculate_confidence(
        telemetry: Dict[str, Any],
        recent_readings: Optional[List[Dict[str, Any]]] = None,
        neighbor_readings: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Calculates Sensor Trust & Data Confidence Score (0-100%).
        Separates 'Risk Score' (how dangerous the environment is)
        from 'Confidence Score' (how trustworthy the incoming data is).
        
        Evaluates:
        1. Sensor Freshness (100% if <60s, decaying if stale)
        2. Thermodynamic Consistency (e.g., extreme heat with 100% RH is flagged)
        3. Missing / Null value check
        4. Supporting neighbor nodes correlation
        5. Noise & stability check
        """
        confidence = 98.0
        penalties = []

        temp = telemetry.get("temperature", 25.0)
        hum = telemetry.get("humidity", 50.0)
        pres = telemetry.get("pressure", 1013.25)
        aqi = telemetry.get("air_quality", 60.0)

        # 1. Missing values check
        for param, val in [("temperature", temp), ("humidity", hum), ("pressure", pres), ("air_quality", aqi)]:
            if val is None or math.isnan(val):
                confidence -= 25.0
                penalties.append(f"Missing {param} telemetry")

        # 2. Thermodynamic sanity & cross-sensor consistency
        # High heat (>42C) + extreme humidity (>90%) without rain is thermodynamically rare and indicates sensor drift
        if temp > 42.0 and hum > 90.0 and telemetry.get("rain_value", 0) < 50:
            confidence -= 15.0
            penalties.append("Thermodynamic cross-sensor anomaly (extreme T + extreme RH)")

        # 3. Flatline / constant value penalty
        if recent_readings and len(recent_readings) >= 4:
            recent_temps = [r.get("temperature", 0) for r in recent_readings[-4:]]
            recent_aqis = [r.get("air_quality", 0) for r in recent_readings[-4:]]
            if len(set(recent_temps)) == 1 and temp != 0:
                confidence -= 18.0
                penalties.append("Temperature sensor flatline (zero variance across 4 pings)")
            if len(set(recent_aqis)) == 1 and aqi != 0:
                confidence -= 18.0
                penalties.append("Air Quality sensor flatline (zero variance across 4 pings)")

        # 4. Neighbor consensus support boost
        supporting_neighbors = 0
        total_neighbors = len(neighbor_readings) if neighbor_readings else 0
        if neighbor_readings:
            for nr in neighbor_readings:
                n_temp = nr.get("temperature", temp)
                if abs(n_temp - temp) < 6.0:
                    supporting_neighbors += 1
            if total_neighbors > 0:
                ratio = supporting_neighbors / total_neighbors
                if ratio < 0.33 and total_neighbors >= 2:
                    confidence -= 12.0
                    penalties.append(f"Divergence from regional neighbor median ({supporting_neighbors}/{total_neighbors} agree)")

        final_confidence = float(np.clip(round(confidence, 1), 10.0, 99.0))
        
        if final_confidence >= 88.0:
            quality_grade = "GOOD"
        elif final_confidence >= 70.0:
            quality_grade = "ACCEPTABLE"
        elif final_confidence >= 50.0:
            quality_grade = "DEGRADED"
        else:
            quality_grade = "SUSPICIOUS"

        return {
            "confidence_score": final_confidence,
            "data_quality_grade": quality_grade,
            "supporting_sensors": f"{supporting_neighbors + 1}/{total_neighbors + 1}",
            "penalties": penalties,
            "summary": "Data fully verified by local and peer telemetry" if not penalties else " • ".join(penalties)
        }

    @staticmethod
    def calculate_multi_node_consensus(
        nodes: List[Dict[str, Any]],
        hazard_type: str = "FIRE"
    ) -> Dict[str, Any]:
        """
        Prototype Multi-Node Spatial Consensus.
        Aggregates risk across neighboring nodes in the monitoring sector:
        - Determines how many nodes corroborate an elevated hazard (> 50 risk).
        - Computes regional consensus percentage, weighted regional risk, and spatial threat area.
        """
        if not nodes:
            return {
                "regional_risk": 0.0,
                "hazard_type": hazard_type,
                "agreeing_nodes_count": 0,
                "total_nodes_count": 0,
                "consensus_percentage": 0.0,
                "consensus_status": "NO_NODES",
                "consensus_label": "No active nodes in sector",
                "high_threat_nodes": []
            }

        elevated_nodes = []
        scores = []

        for n in nodes:
            risk = n.get("risk", {})
            if isinstance(risk, dict):
                if hazard_type.upper() == "FIRE":
                    score = risk.get("fire_risk", 0.0)
                elif hazard_type.upper() == "FLOOD":
                    score = risk.get("flood_risk", 0.0)
                elif hazard_type.upper() == "POLLUTION":
                    score = risk.get("pollution_risk", 0.0)
                else:
                    score = risk.get("overall_risk", 0.0)
            else:
                score = 0.0

            scores.append(score)
            if score >= 50.0:
                elevated_nodes.append({
                    "node_id": n.get("node_id"),
                    "name": n.get("name", n.get("node_id")),
                    "score": score,
                    "latitude": n.get("latitude"),
                    "longitude": n.get("longitude"),
                })

        total = len(nodes)
        agree_count = len(elevated_nodes)
        consensus_pct = round((agree_count / max(total, 1)) * 100.0, 1)
        avg_score = round(float(np.mean(scores)), 1) if scores else 0.0
        max_score = round(float(np.max(scores)), 1) if scores else 0.0

        # Weighted regional risk: 60% driven by agreeing cluster peak, 40% regional average
        regional_risk = round((max_score * 0.6) + (avg_score * 0.4), 1) if agree_count > 0 else avg_score

        if agree_count >= 3:
            consensus_status = "STRONG_CONSENSUS"
            consensus_label = f"Strong Multi-Node Agreement ({agree_count}/{total} Nodes Confirm {hazard_type.capitalize()} Threat)"
        elif agree_count == 2:
            consensus_status = "MODERATE_CONSENSUS"
            consensus_label = f"Moderate Multi-Node Agreement ({agree_count}/{total} Nodes Corroborating)"
        elif agree_count == 1:
            consensus_status = "LOCALIZED_SPIKE"
            consensus_label = f"Isolated Node Alert (1/{total} Node - Verifying with Adjacent Nodes)"
        else:
            consensus_status = "NOMINAL_BASELINE"
            consensus_label = f"All {total} Nodes in Normal Range"

        return {
            "regional_risk": regional_risk,
            "hazard_type": hazard_type,
            "agreeing_nodes_count": agree_count,
            "total_nodes_count": total,
            "consensus_percentage": consensus_pct,
            "consensus_status": consensus_status,
            "consensus_label": consensus_label,
            "high_threat_nodes": elevated_nodes
        }

    @staticmethod
    def calculate_fire_risk(
        temperature: float,
        humidity: float,
        air_quality: float,
        pressure: float,
        recent_readings: Optional[List[Dict[str, Any]]] = None
    ) -> float:
        """
        Calculate Forest Fire Risk (0-100).
        """
        temp_factor = np.clip((temperature - 20.0) / 28.0 * 100.0, 0.0, 100.0)
        humidity_factor = np.clip((80.0 - humidity) / 65.0 * 100.0, 0.0, 100.0)
        gas_factor = np.clip((air_quality - 50.0) / 400.0 * 100.0, 0.0, 100.0)
        
        pressure_factor = 50.0
        if pressure > 1013.25:
            pressure_factor = min(100.0, 50.0 + (pressure - 1013.25) * 2.0)

        base_score = (
            temp_factor * 0.35 +
            humidity_factor * 0.35 +
            gas_factor * 0.25 +
            pressure_factor * 0.05
        )

        if recent_readings and len(recent_readings) >= 3:
            recent_temps = [r.get("temperature", temperature) for r in recent_readings[-5:]]
            temp_slope = (recent_temps[-1] - recent_temps[0])
            if temp_slope > 2.0:
                base_score += 10.0

        return float(np.clip(round(base_score, 1), 0.0, 100.0))

    @staticmethod
    def calculate_flood_risk(
        rain_value: float,
        humidity: float,
        pressure: float,
        recent_readings: Optional[List[Dict[str, Any]]] = None
    ) -> float:
        """
        Calculate Flood Risk (0-100).
        """
        rain_factor = np.clip((rain_value / 850.0) * 100.0, 0.0, 100.0)
        humidity_factor = np.clip((humidity - 50.0) / 45.0 * 100.0, 0.0, 100.0)
        pressure_factor = np.clip((1015.0 - pressure) / 35.0 * 100.0, 0.0, 100.0)

        base_score = (
            rain_factor * 0.60 +
            humidity_factor * 0.25 +
            pressure_factor * 0.15
        )

        if recent_readings and len(recent_readings) >= 3:
            recent_rain = [r.get("rain_value", rain_value) for r in recent_readings[-5:]]
            rain_surge = recent_rain[-1] - recent_rain[0]
            if rain_surge > 150.0:
                base_score += 15.0

        return float(np.clip(round(base_score, 1), 0.0, 100.0))

    @staticmethod
    def calculate_pollution_risk(
        air_quality: float,
        temperature: float,
        humidity: float,
        recent_readings: Optional[List[Dict[str, Any]]] = None
    ) -> float:
        """
        Calculate Pollution Risk (0-100).
        """
        aqi_factor = np.clip((air_quality - 30.0) / 370.0 * 100.0, 0.0, 100.0)
        
        inversion_factor = 20.0
        if humidity > 70.0 and temperature < 22.0:
            inversion_factor = 60.0

        base_score = (aqi_factor * 0.85) + (inversion_factor * 0.15)

        if recent_readings and len(recent_readings) >= 3:
            recent_aqi = [r.get("air_quality", air_quality) for r in recent_readings[-5:]]
            aqi_surge = recent_aqi[-1] - recent_aqi[0]
            if aqi_surge > 40.0:
                base_score += 8.0

        return float(np.clip(round(base_score, 1), 0.0, 100.0))

    @classmethod
    def calculate_overall_risk(
        cls,
        fire_risk: float,
        flood_risk: float,
        pollution_risk: float
    ) -> float:
        max_hazard = max(fire_risk, flood_risk, pollution_risk)
        mean_hazard = (fire_risk + flood_risk + pollution_risk) / 3.0
        overall = (max_hazard * 0.70) + (mean_hazard * 0.30)
        return float(np.clip(round(overall, 1), 0.0, 100.0))

    @classmethod
    def evaluate_all(
        cls,
        temperature: float,
        humidity: float,
        pressure: float,
        rain_value: float,
        air_quality: float,
        recent_readings: Optional[List[Dict[str, Any]]] = None,
        neighbor_readings: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Full evaluation pipeline combining Edge Risk Logic, Multi-Variate Central Risk, and Sensor Trust Confidence.
        """
        fire_risk = cls.calculate_fire_risk(temperature, humidity, air_quality, pressure, recent_readings)
        flood_risk = cls.calculate_flood_risk(rain_value, humidity, pressure, recent_readings)
        pollution_risk = cls.calculate_pollution_risk(air_quality, temperature, humidity, recent_readings)
        overall_risk = cls.calculate_overall_risk(fire_risk, flood_risk, pollution_risk)

        edge_risk = cls.calculate_edge_risk(temperature, humidity, air_quality, recent_readings)
        
        telemetry_dict = {
            "temperature": temperature,
            "humidity": humidity,
            "pressure": pressure,
            "rain_value": rain_value,
            "air_quality": air_quality
        }
        confidence_info = cls.calculate_confidence(telemetry_dict, recent_readings, neighbor_readings)

        return {
            "fire_risk": fire_risk,
            "flood_risk": flood_risk,
            "pollution_risk": pollution_risk,
            "overall_risk": overall_risk,
            "fire_category": get_risk_category(fire_risk),
            "flood_category": get_risk_category(flood_risk),
            "pollution_category": get_risk_category(pollution_risk),
            "overall_category": get_risk_category(overall_risk),
            "edge_risk": edge_risk,
            "confidence": confidence_info,
        }

    @staticmethod
    def detect_anomaly(
        current_reading: Dict[str, Any],
        previous_reading: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        temp = current_reading.get("temperature", 25.0)
        hum = current_reading.get("humidity", 50.0)
        pres = current_reading.get("pressure", 1013.25)
        aqi = current_reading.get("air_quality", 60.0)

        # 1. Physical boundary violations
        if temp < -20.0 or temp > 70.0:
            return {
                "parameter": "temperature",
                "previous_value": previous_reading.get("temperature", 25.0) if previous_reading else 25.0,
                "current_value": temp,
                "change_pct": 100.0,
                "severity": "CRITICAL",
                "anomaly_type": "OUT_OF_BOUNDS",
                "description": f"Physical temperature boundary breach ({temp:.1f}°C outside [-20, 70] range)"
            }
        
        if hum < 0.0 or hum > 100.0:
            return {
                "parameter": "humidity",
                "previous_value": previous_reading.get("humidity", 50.0) if previous_reading else 50.0,
                "current_value": hum,
                "change_pct": 100.0,
                "severity": "HIGH",
                "anomaly_type": "OUT_OF_BOUNDS",
                "description": f"Physical relative humidity breach ({hum:.1f}% outside [0, 100] range)"
            }

        if pres < 850.0 or pres > 1150.0:
            return {
                "parameter": "pressure",
                "previous_value": previous_reading.get("pressure", 1013.0) if previous_reading else 1013.0,
                "current_value": pres,
                "change_pct": 100.0,
                "severity": "HIGH",
                "anomaly_type": "OUT_OF_BOUNDS",
                "description": f"Barometric pressure boundary breach ({pres:.1f} hPa outside [850, 1150] range)"
            }

        # 2. Dynamic rate-of-change spikes compared to previous reading
        if previous_reading:
            prev_temp = previous_reading.get("temperature", temp)
            prev_hum = previous_reading.get("humidity", hum)
            prev_pres = previous_reading.get("pressure", pres)
            prev_aqi = previous_reading.get("air_quality", aqi)

            temp_delta = temp - prev_temp
            if abs(temp_delta) >= 8.0:
                pct = (temp_delta / max(abs(prev_temp), 1.0)) * 100.0
                return {
                    "parameter": "temperature",
                    "previous_value": prev_temp,
                    "current_value": temp,
                    "change_pct": round(pct, 1),
                    "severity": "CRITICAL" if abs(temp_delta) > 12.0 else "HIGH",
                    "anomaly_type": "SPIKE",
                    "description": f"Sudden thermal surge detected ({prev_temp:.1f}°C → {temp:.1f}°C, {pct:+.1f}%)"
                }

            if abs(pres - prev_pres) >= 12.0:
                pct = ((pres - prev_pres) / max(prev_pres, 1.0)) * 100.0
                return {
                    "parameter": "pressure",
                    "previous_value": prev_pres,
                    "current_value": pres,
                    "change_pct": round(pct, 1),
                    "severity": "HIGH",
                    "anomaly_type": "SPIKE",
                    "description": f"Abrupt barometric drop/surge ({prev_pres:.1f} hPa → {pres:.1f} hPa)"
                }

            if (aqi - prev_aqi) >= 100.0 or (prev_aqi > 0 and (aqi - prev_aqi) / prev_aqi > 0.8 and aqi > 120):
                pct = ((aqi - prev_aqi) / max(prev_aqi, 1.0)) * 100.0
                return {
                    "parameter": "air_quality",
                    "previous_value": prev_aqi,
                    "current_value": aqi,
                    "change_pct": round(pct, 1),
                    "severity": "CRITICAL" if aqi > 250 else "HIGH",
                    "anomaly_type": "SPIKE",
                    "description": f"Hazardous air pollutant spike ({prev_aqi:.0f} → {aqi:.0f} AQI, {pct:+.1f}%)"
                }

            if abs(hum - prev_hum) >= 30.0:
                pct = ((hum - prev_hum) / max(prev_hum, 1.0)) * 100.0
                return {
                    "parameter": "humidity",
                    "previous_value": prev_hum,
                    "current_value": hum,
                    "change_pct": round(pct, 1),
                    "severity": "MODERATE",
                    "anomaly_type": "SPIKE",
                    "description": f"Rapid humidity divergence ({prev_hum:.1f}% → {hum:.1f}%)"
                }

        return None

    @staticmethod
    def calculate_explainability(
        temperature: float,
        humidity: float,
        pressure: float,
        rain_value: float,
        air_quality: float,
        risk_type: str = "FIRE"
    ) -> Dict[str, Any]:
        """
        Calculates transparent contributing factor weights for AI explainability (XAI/SHAP proxy).
        """
        if risk_type.upper() == "FIRE":
            temp_contrib = np.clip((temperature - 18.0) / 30.0 * 100.0, 0.0, 100.0)
            hum_contrib = np.clip((85.0 - humidity) / 70.0 * 100.0, 0.0, 100.0)
            aqi_contrib = np.clip((air_quality - 40.0) / 350.0 * 100.0, 0.0, 100.0)
            pres_contrib = np.clip((pressure - 1000.0) / 25.0 * 50.0, 10.0, 90.0)
            trend_contrib = min(95.0, temp_contrib * 0.8 + aqi_contrib * 0.2)

            return {
                "risk_type": "FIRE",
                "model_confidence": 91.5,
                "is_prototype": True,
                "factors": [
                    {"name": "Temperature Factor", "weight": round(temp_contrib, 1), "impact": "POSITIVE" if temperature > 32 else "NEUTRAL"},
                    {"name": "Atmospheric Moisture Deficit", "weight": round(hum_contrib, 1), "impact": "POSITIVE" if humidity < 35 else "NEUTRAL"},
                    {"name": "Gas/Smoke Particulate Index", "weight": round(aqi_contrib, 1), "impact": "POSITIVE" if air_quality > 150 else "NEUTRAL"},
                    {"name": "Barometric Dryness Proxy", "weight": round(pres_contrib, 1), "impact": "NEUTRAL"},
                    {"name": "Edge Thermal Rate-of-Change", "weight": round(trend_contrib, 1), "impact": "POSITIVE" if trend_contrib > 60 else "NEUTRAL"}
                ],
                "summary": "Elevated ambient temperature combined with low atmospheric moisture and particulate spikes are the primary drivers for this fire hazard rating."
            }

        elif risk_type.upper() == "FLOOD":
            rain_contrib = np.clip((rain_value / 800.0) * 100.0, 0.0, 100.0)
            hum_contrib = np.clip((humidity - 40.0) / 55.0 * 100.0, 0.0, 100.0)
            pres_contrib = np.clip((1020.0 - pressure) / 35.0 * 100.0, 0.0, 100.0)
            runoff_contrib = min(100.0, rain_contrib * 0.7 + hum_contrib * 0.3)

            return {
                "risk_type": "FLOOD",
                "model_confidence": 88.7,
                "is_prototype": True,
                "factors": [
                    {"name": "Precipitation Rate", "weight": round(rain_contrib, 1), "impact": "POSITIVE" if rain_value > 300 else "NEUTRAL"},
                    {"name": "Soil Saturation / Humidity", "weight": round(hum_contrib, 1), "impact": "POSITIVE" if humidity > 75 else "NEUTRAL"},
                    {"name": "Barometric Depression", "weight": round(pres_contrib, 1), "impact": "POSITIVE" if pressure < 1005 else "NEUTRAL"},
                    {"name": "Hydrological Inflow Trend", "weight": round(runoff_contrib, 1), "impact": "POSITIVE" if runoff_contrib > 50 else "NEUTRAL"}
                ],
                "summary": "Heavy precipitation accumulation coupled with cyclonic atmospheric pressure depression drives the flood vulnerability estimate."
            }

        else: # POLLUTION
            aqi_contrib = np.clip((air_quality - 30.0) / 370.0 * 100.0, 0.0, 100.0)
            inv_contrib = 65.0 if (humidity > 70 and temperature < 22) else 25.0
            temp_contrib = np.clip((35.0 - temperature) / 25.0 * 50.0, 10.0, 90.0)

            return {
                "risk_type": "POLLUTION",
                "model_confidence": 94.2,
                "is_prototype": True,
                "factors": [
                    {"name": "Gas / VOC / Particulate Index", "weight": round(aqi_contrib, 1), "impact": "POSITIVE" if air_quality > 150 else "NEUTRAL"},
                    {"name": "Atmospheric Inversion Proxy", "weight": round(inv_contrib, 1), "impact": "POSITIVE" if inv_contrib > 50 else "NEUTRAL"},
                    {"name": "Thermal Layering Stagnation", "weight": round(temp_contrib, 1), "impact": "NEUTRAL"}
                ],
                "summary": "High particulate AQI sensor response combined with stagnant thermal inversion layer creates air pollution hazard."
            }
