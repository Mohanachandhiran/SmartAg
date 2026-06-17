from typing import Dict, Any
import random

def assess_risk(crop: str, district: str, harvest_date: str) -> Dict[str, Any]:
    crop_lower = crop.lower()
    dist_lower = district.lower()
    
    # Base risk values based on crop properties
    # Volatile/perishable crops like tomatoes and bananas have higher base risks
    is_perishable = crop_lower in ["tomato", "banana", "chilli"]
    
    weather_factor = random.choice(["Low", "Medium", "High"])
    if dist_lower == "madurai" and is_perishable:
        weather_factor = "High"  # Simulate stormy conditions in Madurai for tender crops
        
    market_volatility = "High" if crop_lower in ["tomato", "onion"] else "Low"
    transport_risk = "Medium" if is_perishable else "Low"
    spoilage_risk = "High" if is_perishable else "Low"
    supply_risk = "Medium"
    
    # Calculate overall risk
    risk_points = {
        "Low": 1,
        "Medium": 2,
        "High": 3
    }
    
    avg_score = (
        risk_points[weather_factor] * 0.3 + 
        risk_points[market_volatility] * 0.3 + 
        risk_points[transport_risk] * 0.15 + 
        risk_points[spoilage_risk] * 0.15 + 
        risk_points[supply_risk] * 0.1
    )
    
    if avg_score >= 2.3:
        overall = "High"
    elif avg_score >= 1.6:
        overall = "Medium"
    else:
        overall = "Low"
        
    return {
        "overall": overall,
        "weather": weather_factor,
        "market": market_volatility,
        "transport": transport_risk,
        "spoilage": spoilage_risk,
        "supply": supply_risk
    }
