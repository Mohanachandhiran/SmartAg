from typing import List, Dict, Any

def score_buyer(buyer: Dict[str, Any]) -> float:
    # score = (price * 0.4) + (trust_score * 0.3) - (transport_cost * 0.2) - (risk * 0.1)
    price = float(buyer.get("offeredPrice", 0.0))
    trust_score = float(buyer.get("trustScore", 3.0)) * 20.0  # Normalize 0-5 to 0-100
    
    # Calculate transport cost penalty
    # Assume max transport cost of 5000 for normalization
    transport = float(buyer.get("transportCost", 0.0))
    transport_norm = min((transport / 5000.0) * 100.0, 100.0)
    
    # Map risk levels to numeric penalties
    risk_map = {"Low": 0.0, "Medium": 50.0, "High": 100.0}
    risk_val = risk_map.get(buyer.get("risk", "Medium"), 50.0)
    
    # Normalize price relative to base of 150
    price_norm = min((price / 150.0) * 100.0, 100.0)
    
    score = (price_norm * 0.4) + (trust_score * 0.3) - (transport_norm * 0.2) - (risk_val * 0.1)
    return round(score, 2)

def rank_buyers(lot_id: str, buyers: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not buyers:
        return {
            "ranked_buyers": [],
            "recommended_buyer": None,
            "expectedRevenue": 0.0,
            "netRevenue": 0.0,
            "risk": "Low",
            "confidence": 0.0
        }
        
    scored = []
    for b in buyers:
        score = score_buyer(b)
        scored.append({**b, "score": score})
        
    # Sort by score descending
    scored.sort(key=lambda x: x["score"], reverse=True)
    
    recommended = scored[0]
    expected_rev = float(recommended.get("offeredPrice", 0.0)) * float(recommended.get("quantity", 1000.0))
    net_rev = expected_rev - float(recommended.get("transportCost", 0.0))
    
    return {
        "ranked_buyers": scored,
        "recommended_buyer": recommended,
        "expectedRevenue": round(expected_rev, 2),
        "netRevenue": round(net_rev, 2),
        "risk": recommended.get("risk", "Low"),
        "confidence": round(recommended["score"], 1)
    }
