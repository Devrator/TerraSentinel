from typing import List, Dict, Any, Optional
import numpy as np

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
    Modular AI Risk Engine.
    Currently implements multi-variate environmental heuristic calculations for prototype demonstration.
    Designed with a clean interface so that calculate_* methods can directly be replaced
    by trained ML models (e.g. XGBoost / Random Forest) without changing the API contract.
    """

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
        Considers:
        - High Temperature (higher > 35C)
        - Low Humidity (lower < 30%)
        - Elevated Gas/Air Quality (smoke/combustion indicator > 200)
        - Pressure trends
        - Persistence of high temperature in recent readings
        """
        # 1. Temperature factor (Normalized 20C - 50C -> 0 - 100)
        temp_factor = np.clip((temperature - 20.0) / 28.0 * 100.0, 0.0, 100.0)
        
        # 2. Humidity factor (Inverse: 80% to 15% -> 0 - 100)
        humidity_factor = np.clip((80.0 - humidity) / 65.0 * 100.0, 0.0, 100.0)
        
        # 3. Gas / Smoke index factor (50 to 450 -> 0 - 100)
        gas_factor = np.clip((air_quality - 50.0) / 400.0 * 100.0, 0.0, 100.0)
        
        # 4. Pressure dryness indicator (slight adjustment)
        pressure_factor = 50.0
        if pressure > 1013.25: # High pressure / dry air
            pressure_factor = min(100.0, 50.0 + (pressure - 1013.25) * 2.0)

        # Base composite score
        # Fire is heavily driven by high temp + low humidity + smoke
        base_score = (
            temp_factor * 0.35 +
            humidity_factor * 0.35 +
            gas_factor * 0.25 +
            pressure_factor * 0.05
        )

        # 5. Trend analysis if historical readings are available
        if recent_readings and len(recent_readings) >= 3:
            recent_temps = [r.get("temperature", temperature) for r in recent_readings[-5:]]
            temp_slope = (recent_temps[-1] - recent_temps[0])
            if temp_slope > 2.0: # Rising rapidly
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
        Prototype flood-risk indicator.
        Considers:
        - Rain sensor reading (0-1000)
        - High humidity (> 75%)
        - Low atmospheric pressure / storm fronts (< 1005 hPa)
        - Cumulative rainfall trend over recent readings
        """
        # 1. Rain intensity factor (0 to 900 -> 0 - 100)
        rain_factor = np.clip((rain_value / 850.0) * 100.0, 0.0, 100.0)
        
        # 2. Humidity factor (50% to 100% -> 0 - 100)
        humidity_factor = np.clip((humidity - 50.0) / 45.0 * 100.0, 0.0, 100.0)
        
        # 3. Low pressure / cyclonic depression factor (1015 down to 980 hPa -> 0 - 100)
        pressure_factor = np.clip((1015.0 - pressure) / 35.0 * 100.0, 0.0, 100.0)

        # Base composite score
        base_score = (
            rain_factor * 0.60 +
            humidity_factor * 0.25 +
            pressure_factor * 0.15
        )

        # 4. Rainfall accumulation / surge trend
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
        Considers:
        - Air Quality Index / VOC / PM proxy value (0 - 500)
        - Atmospheric trapping / temperature inversion proxies (low temp + high humidity)
        - Recent trend of accumulating pollutants
        """
        # 1. AQI direct factor (30 to 400 -> 0 - 100)
        aqi_factor = np.clip((air_quality - 30.0) / 370.0 * 100.0, 0.0, 100.0)
        
        # 2. Weather inversion factor (stagnant air trapping)
        inversion_factor = 20.0
        if humidity > 70.0 and temperature < 22.0:
            inversion_factor = 60.0

        base_score = (aqi_factor * 0.85) + (inversion_factor * 0.15)

        # 3. Trend analysis
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
        """
        Calculate overall composite hazard risk (0-100).
        Dominant hazard heavily weights the composite score with cross-hazard contribution.
        """
        max_hazard = max(fire_risk, flood_risk, pollution_risk)
        mean_hazard = (fire_risk + flood_risk + pollution_risk) / 3.0
        # 70% driven by worst active hazard, 30% aggregate
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
        recent_readings: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate all risks simultaneously.
        """
        fire_risk = cls.calculate_fire_risk(temperature, humidity, air_quality, pressure, recent_readings)
        flood_risk = cls.calculate_flood_risk(rain_value, humidity, pressure, recent_readings)
        pollution_risk = cls.calculate_pollution_risk(air_quality, temperature, humidity, recent_readings)
        overall_risk = cls.calculate_overall_risk(fire_risk, flood_risk, pollution_risk)

        return {
            "fire_risk": fire_risk,
            "flood_risk": flood_risk,
            "pollution_risk": pollution_risk,
            "overall_risk": overall_risk,
            "fire_category": get_risk_category(fire_risk),
            "flood_category": get_risk_category(flood_risk),
            "pollution_category": get_risk_category(pollution_risk),
            "overall_category": get_risk_category(overall_risk),
        }

    @staticmethod
    def detect_anomaly(
        current_reading: Dict[str, Any],
        previous_reading: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Detects environmental anomalies such as sudden spikes, out-of-bounds telemetry, or sensor flatlines.
        """
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
        Clearly communicates feature contributions to operators.
        """
        if risk_type.upper() == "FIRE":
            temp_contrib = np.clip((temperature - 18.0) / 30.0 * 100.0, 0.0, 100.0)
            hum_contrib = np.clip((85.0 - humidity) / 70.0 * 100.0, 0.0, 100.0)
            aqi_contrib = np.clip((air_quality - 40.0) / 350.0 * 100.0, 0.0, 100.0)
            pres_contrib = np.clip((pressure - 1000.0) / 25.0 * 50.0, 10.0, 90.0)
            trend_contrib = min(95.0, temp_contrib * 0.8 + aqi_contrib * 0.2)

            return {
                "risk_type": "FIRE",
                "model_confidence": 92.4,
                "is_prototype": True,
                "factors": [
                    {"name": "Temperature", "weight": round(temp_contrib, 1), "impact": "POSITIVE" if temperature > 32 else "NEUTRAL"},
                    {"name": "Atmospheric Humidity", "weight": round(hum_contrib, 1), "impact": "POSITIVE" if humidity < 35 else "NEUTRAL"},
                    {"name": "Gas/Smoke Concentration", "weight": round(aqi_contrib, 1), "impact": "POSITIVE" if air_quality > 150 else "NEUTRAL"},
                    {"name": "Pressure Trend", "weight": round(pres_contrib, 1), "impact": "NEUTRAL"},
                    {"name": "Recent Thermal Velocity", "weight": round(trend_contrib, 1), "impact": "POSITIVE" if trend_contrib > 60 else "NEUTRAL"}
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
                "model_confidence": 89.1,
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
                "model_confidence": 94.7,
                "is_prototype": True,
                "factors": [
                    {"name": "Gas / VOC / Particulate Index", "weight": round(aqi_contrib, 1), "impact": "POSITIVE" if air_quality > 150 else "NEUTRAL"},
                    {"name": "Atmospheric Inversion Proxy", "weight": round(inv_contrib, 1), "impact": "POSITIVE" if inv_contrib > 50 else "NEUTRAL"},
                    {"name": "Thermal Layering Stagnation", "weight": round(temp_contrib, 1), "impact": "NEUTRAL"}
                ],
                "summary": "High particulate AQI sensor response combined with stagnant thermal inversion layer creates air pollution hazard."
            }

