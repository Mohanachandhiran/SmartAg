import math
import os
import json
import google.generativeai as genai
from datetime import datetime, timedelta
from typing import List, Dict, Any

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Earth radius in kilometers
    r = 6371.0
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2.0)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0)**2
        
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c

def parse_date(date_str: str) -> datetime:
    try:
        # Standard ISO formats
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except Exception:
        return datetime.now()

def fallback_group_farmers(farms: List[Dict[str, Any]]) -> Dict[str, Any]:
    groups = []
    # 1. Group by crop type
    by_crop: Dict[str, List[Dict[str, Any]]] = {}
    for farm in farms:
        crop = farm.get("cropType", "Unknown")
        if crop not in by_crop:
            by_crop[crop] = []
        by_crop[crop].append(farm)
        
    group_id_counter = 1
    
    # 2. Within each crop, cluster by proximity and harvest dates (window of +/- 3 days)
    for crop, crop_farms in by_crop.items():
        # Keep track of which farms are clustered
        assigned = set()
        
        for i, farm1 in enumerate(crop_farms):
            if farm1["farmId"] in assigned:
                continue
                
            # Start a new cluster
            cluster = [farm1]
            assigned.add(farm1["farmId"])
            date1 = parse_date(farm1["harvestDate"])
            
            for j, farm2 in enumerate(crop_farms):
                if farm2["farmId"] in assigned:
                    continue
                
                # Check harvest date window (3 days)
                date2 = parse_date(farm2["harvestDate"])
                date_diff = abs((date1 - date2).days)
                
                if date_diff <= 3:
                    # Check distance (under 25km)
                    dist = haversine_distance(
                        farm1["gpsLat"], farm1["gpsLng"],
                        farm2["gpsLat"], farm2["gpsLng"]
                    )
                    
                    if dist <= 25.0:
                        cluster.append(farm2)
                        assigned.add(farm2["farmId"])
            
            # Create group details
            farmers_list = []
            total_qty = 0.0
            
            for f in cluster:
                total_qty += f["quantity"]
                farmers_list.append({
                    "farmId": f["farmId"],
                    "farmerId": f["farmerId"],
                    "name": f.get("farmerName", "Farmer"),
                    "quantity": f["quantity"],
                    "lat": f["gpsLat"],
                    "lng": f["gpsLng"]
                })
            
            # Simple route coordinates
            route_coords = [[f["lat"], f["lng"]] for f in farmers_list]
            
            # Earliest harvest date as collection date
            collection_date = min([parse_date(f["harvestDate"]) for f in cluster])
            
            groups.append({
                "groupId": f"GRP-{crop.upper()}-{group_id_counter:03d}",
                "cropType": crop,
                "farmers": farmers_list,
                "totalQuantity": total_qty,
                "collectionDate": (collection_date + timedelta(days=2)).isoformat(),
                "route": {
                    "distance": round(len(cluster) * 8.4, 2),
                    "timeMinutes": len(cluster) * 20,
                    "routeCoords": route_coords
                }
            })
            group_id_counter += 1
            
    return {"groups": groups}


def get_mock_context() -> Dict[str, Any]:
    return {
        "buyers": [
            {"buyerId": "B1", "name": "Reliance Fresh", "location": "Chennai", "requiredCrop": "Tomato", "offeredPrice": 25.0, "reliabilityScore": 0.92},
            {"buyerId": "B2", "name": "Local Mandi Buyers", "location": "Madurai", "requiredCrop": "Onion", "offeredPrice": 18.0, "reliabilityScore": 0.85},
            {"buyerId": "B3", "name": "Export Quality Corp", "location": "Coimbatore", "requiredCrop": "Banana", "offeredPrice": 45.0, "reliabilityScore": 0.98}
        ],
        "weather": {
            "forecast": "Light rain expected in next 3 days",
            "riskLevel": "Low"
        },
        "marketPrices": {
            "Tomato": {"current": 22.0, "forecast": 24.0},
            "Onion": {"current": 16.0, "forecast": 15.0},
            "Banana": {"current": 40.0, "forecast": 42.0}
        }
    }

def group_farmers(farms: List[Dict[str, Any]]) -> Dict[str, Any]:
    api_key = os.environ.get("GEMINI_API_KEY", "MOCK_GEMINI_API_KEY")
    if api_key == "MOCK_GEMINI_API_KEY" or not api_key:
        return fallback_group_farmers(farms)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        system_instruction = """You are SmartAg Collective AI Grouping Engine.
Your purpose is to maximize farmer profit through intelligent collective selling.
You are NOT a chatbot. You DO NOT answer questions. You only create farmer groups and recommend buyers.

====================================================
PRIMARY OBJECTIVE
Maximize Net Farmer Profit (Revenue - Transport Cost - Handling Cost - Risk Cost)

====================================================
GROUPING CONDITIONS
Farmers may be grouped only when:
1. Same Crop
2. Harvest Date Difference <= 5 Days
3. Radius <= 20 km

====================================================
BUYER SCORING
Buyer Score = 40% Price + 20% Reliability + 15% Logistics Cost + 15% Weather Risk + 10% Distance

====================================================
OUTPUT FORMAT
You MUST output strictly in the following JSON format:
{
  "groups": [
    {
      "groupId": "GRP-[CROP]-001",
      "cropType": "[Crop]",
      "totalQuantity": [Total Quantity Number],
      "collectionDate": "[Earliest Harvest Date ISO format]",
      "recommendedBuyer": "[Buyer Name]",
      "buyerPrice": [Price Number],
      "expectedRevenue": [Total Revenue Number],
      "expectedNetProfit": [Profit Number],
      "transportCost": [Transport Cost Number],
      "weatherRisk": "[Risk Level]",
      "confidenceScore": [Score % Number],
      "reasonForSelection": "[Brief Explanation]",
      "route": {
          "distance": [Total Route Distance in km],
          "timeMinutes": [Total Route Time in mins]
      },
      "farmers": [
        {
          "farmId": "[Farm ID]",
          "farmerId": "[Farmer ID]",
          "name": "[Farmer Name]",
          "quantity": [Quantity Number],
          "lat": [Latitude Number],
          "lng": [Longitude Number]
        }
      ]
    }
  ]
}
"""
        context = get_mock_context()
        prompt = f"System Instruction:\n{system_instruction}\n\nFarms Data:\n{json.dumps(farms)}\n\nMarket/Buyer/Weather Context:\n{json.dumps(context)}"
        
        response = model.generate_content(prompt, generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json"
        ))
        
        return json.loads(response.text)
    except Exception as e:
        print(f"AI Grouping Engine failed: {e}. Falling back to heuristic.")
        return fallback_group_farmers(farms)
