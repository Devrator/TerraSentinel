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
