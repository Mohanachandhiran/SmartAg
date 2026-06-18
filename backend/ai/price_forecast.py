import random
from typing import Dict, Any

def forecast_price(crop: str, district: str, date_range: int = 7) -> Dict[str, Any]:
    # Base prices per kg
    base_prices = {
        "tomato": 22.0,
        "onion": 28.0,
        "banana": 35.0,
        "rice": 45.0,
        "turmeric": 110.0,
        "chilli": 140.0,
        "coconut": 18.0
    }
    
    crop_lower = crop.lower()
    base = base_prices.get(crop_lower, 25.0)
    
    # Simple simulated trend: tomato/onion show high volatility, rice/turmeric stable
    trend_type = "volatile" if crop_lower in ["tomato", "onion", "chilli"] else "stable"
    
    # Generate forecasted prices with simple trend + noise
    trend_factor = 0.02 if trend_type == "volatile" else 0.005
    
    day1 = round(base * (1 + trend_factor + random.uniform(-0.05, 0.05)), 2)
    day3 = round(base * (1 + trend_factor * 3 + random.uniform(-0.08, 0.08)), 2)
    day7 = round(base * (1 + trend_factor * 7 + random.uniform(-0.12, 0.12)), 2)
    
    trend = "upward" if day7 > base else ("downward" if day7 < base else "stable")
    confidence = round(random.uniform(70.0, 95.0), 1)
    
    return {
        "day1": day1,
        "day3": day3,
        "day7": day7,
        "confidence": confidence,
        "trend": trend
    }
