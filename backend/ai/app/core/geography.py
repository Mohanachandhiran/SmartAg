"""Geocoding for APMC mandis using district placement within state bounds."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

# Approximate bounding boxes: (min_lat, max_lat, min_lng, max_lng)
STATE_BBOX: dict[str, tuple[float, float, float, float]] = {
    "Andhra Pradesh": (12.6, 19.1, 76.7, 84.8),
    "Gujarat": (20.1, 24.7, 68.2, 74.5),
    "Kerala": (8.2, 12.8, 74.8, 77.4),
    "Madhya Pradesh": (21.1, 26.9, 74.0, 82.8),
    "Punjab": (29.3, 32.5, 73.9, 76.9),
    "Rajasthan": (23.0, 30.2, 69.5, 78.2),
    "Uttar Pradesh": (23.9, 30.4, 77.1, 84.6),
    "West Bengal": (21.5, 27.2, 85.8, 89.9),
    "Maharashtra": (15.6, 22.0, 72.6, 80.9),
    "Karnataka": (11.5, 18.5, 74.0, 78.6),
    "Tamil Nadu": (8.0, 13.5, 76.2, 80.3),
    "Bihar": (24.3, 27.5, 83.3, 88.2),
    "Haryana": (27.7, 30.9, 74.5, 77.6),
    "Odisha": (17.8, 22.6, 81.3, 87.5),
    "Telangana": (15.8, 19.9, 77.2, 81.8),
    "Assam": (24.1, 28.0, 89.7, 96.0),
    "Jharkhand": (22.0, 25.3, 83.3, 87.9),
    "Chhattisgarh": (17.8, 24.1, 80.2, 84.4),
    "Delhi": (28.4, 28.9, 76.8, 77.4),
    "Himachal Pradesh": (30.4, 33.2, 75.6, 79.0),
    "Uttarakhand": (28.7, 31.5, 77.5, 81.0),
}

INDIA_CENTER = (20.5937, 78.9629)
_DATA_DIR = Path(__file__).resolve().parents[1] / "data"


@lru_cache(maxsize=1)
def _district_lookup() -> dict[str, list[float]]:
    path = _DATA_DIR / "district_coords.json"
    if not path.exists():
        return {}
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
        return {k: v for k, v in raw.items() if v}
    except Exception:
        return {}


def _hash01(*parts: str) -> tuple[float, float]:
    seed = abs(hash("|".join(parts))) % 1_000_000
    return (seed % 1000) / 1000, (seed // 1000) / 1000


def market_coordinates(state: str, market: str, district: str = "") -> tuple[float, float]:
    key = f"{district}|{state}"
    lookup = _district_lookup()
    if key in lookup:
        base_lat, base_lng = lookup[key][0], lookup[key][1]
    elif state in STATE_BBOX:
        min_lat, max_lat, min_lng, max_lng = STATE_BBOX[state]
        h1, h2 = _hash01(district or market, state, "district")
        base_lat = min_lat + h1 * (max_lat - min_lat)
        base_lng = min_lng + h2 * (max_lng - min_lng)
    else:
        base_lat, base_lng = INDIA_CENTER

    # Small offset per mandi within the same district
    j1, j2 = _hash01(market, district, state, "market")
    lat = base_lat + (j1 - 0.5) * 0.35
    lng = base_lng + (j2 - 0.5) * 0.35
    return round(lat, 5), round(lng, 5)
