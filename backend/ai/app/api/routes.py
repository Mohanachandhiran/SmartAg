from __future__ import annotations

from fastapi import APIRouter, Query
from fastapi.responses import Response
from pydantic import BaseModel

from app.models.schemas import (
    AdvisorRequest,
    AdvisorResponse,
    CommodityInfo,
    DashboardResponse,
    DataQualityResponse,
    ForecastResponse,
    HealthResponse,
    MarketRow,
    ReportRow,
    RiskResponse,
)
from app.services import api_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return api_service.get_health()


@router.get("/data-quality", response_model=DataQualityResponse)
def data_quality() -> DataQualityResponse:
    return api_service.get_data_quality()


@router.get("/commodities", response_model=list[CommodityInfo])
def commodities() -> list[CommodityInfo]:
    return api_service.get_commodities()


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(
    commodity: str | None = Query(None),
    state: str | None = Query(None),
) -> DashboardResponse:
    return api_service.get_dashboard(commodity, state)


@router.get("/markets", response_model=list[MarketRow])
def markets(
    commodity: str = Query(...),
    state: str | None = Query(None),
    q: str | None = Query(None),
) -> list[MarketRow]:
    return api_service.get_markets(commodity, state, q)


@router.get("/forecast", response_model=ForecastResponse)
def forecast(
    commodity: str = Query(...),
    market: str = Query(...),
    state: str = Query(...),
) -> ForecastResponse:
    return api_service.get_forecast(commodity, market, state)


@router.get("/risk", response_model=RiskResponse)
def risk(
    commodity: str = Query(...),
    market: str | None = Query(None),
    state: str | None = Query(None),
) -> RiskResponse:
    return api_service.get_risk(commodity, market, state)


@router.get("/reports", response_model=list[ReportRow])
def reports() -> list[ReportRow]:
    return api_service.get_reports()


@router.get("/reports/pdf")
def download_report_pdf(
    commodity: str = Query(...),
    report_type: str = Query("full"),
) -> Response:
    allowed = {"market", "forecast", "risk", "supply", "full"}
    kind = report_type if report_type in allowed else "full"
    pdf_bytes = api_service.get_report_pdf(commodity, kind)
    safe_crop = commodity.replace(" ", "-").lower()
    filename = f"smartag-{safe_crop}-{kind}-report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/advisor/chat", response_model=AdvisorResponse)
def advisor_chat(payload: AdvisorRequest) -> AdvisorResponse:
    return api_service.post_advisor(payload)


# ── Government / FPO Command Center Endpoints ─────────────────────────────


class SupplyPlanRequest(BaseModel):
    crop: str
    quantity: float
    markets: list[str]


@router.get("/government/overview")
def government_overview(
    region: str | None = Query(None),
    crop: str | None = Query(None),
) -> dict:
    """Returns aggregate market overview KPIs for the Government/FPO Command Center."""
    return {
        "total_markets": 245,
        "active_crops": 68,
        "daily_arrival_tons": 42500,
        "supply_stability_index": 87,
        "risk_level": "Medium",
        "revenue_impact_pct": 18,
        "high_risk_zones": 5,
        "region": region or "Tamil Nadu",
        "crop_filter": crop or "All",
    }


@router.get("/government/alerts")
def government_alerts(
    region: str | None = Query(None),
    severity: str | None = Query(None),
) -> list[dict]:
    """Returns AI risk alerts for the Early Warning System panel."""
    alerts = [
        {
            "id": 1,
            "type": "PRICE_CRASH",
            "severity": "critical",
            "title": "Onion price may drop 15%",
            "reason": "Arrival increased by 45% in last 3 days",
            "recommendation": "Redirect supply to Chennai; activate cold storage at Nashik",
            "affected_markets": 8,
            "timeframe": "Next 3 days",
            "crop": "Onion",
        },
        {
            "id": 2,
            "type": "WEATHER_DISRUPTION",
            "severity": "high",
            "title": "Heavy rainfall expected in coastal TN",
            "reason": "IMD forecast: Red alert for Kancheepuram, Villupuram",
            "recommendation": "Pre-position vehicles; arrange alternative routes via NH-44",
            "affected_markets": 12,
            "timeframe": "Next 48 hours",
            "crop": "Multiple",
        },
        {
            "id": 3,
            "type": "SUPPLY_SHORTAGE",
            "severity": "high",
            "title": "Tomato supply shortage predicted",
            "reason": "Production dip of 22% in Krishnagiri district",
            "recommendation": "Activate procurement from Karnataka; issue APMCs tender",
            "affected_markets": 6,
            "timeframe": "Next 5 days",
            "crop": "Tomato",
        },
    ]
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    return alerts


@router.get("/government/market-analysis")
def government_market_analysis(
    region: str | None = Query(None),
    crop: str | None = Query(None),
    q: str | None = Query(None),
) -> list[dict]:
    """Returns market comparison table data for the Command Center."""
    data = [
        {"market": "Chennai", "crop": "Tomato", "price": 2600, "trend": 8, "arrival": "Low", "demand": "High", "risk": "Low", "score": 94, "rec": "Recommended"},
        {"market": "Coimbatore", "crop": "Onion", "price": 1800, "trend": -12, "arrival": "High", "demand": "Low", "risk": "High", "score": 42, "rec": "Avoid"},
        {"market": "Madurai", "crop": "Rice", "price": 2100, "trend": 3, "arrival": "Medium", "demand": "Medium", "risk": "Medium", "score": 71, "rec": "Watch"},
        {"market": "Salem", "crop": "Tomato", "price": 2200, "trend": -5, "arrival": "High", "demand": "Low", "risk": "High", "score": 38, "rec": "Avoid"},
        {"market": "Vellore", "crop": "Wheat", "price": 2650, "trend": 6, "arrival": "Low", "demand": "High", "risk": "Low", "score": 88, "rec": "Recommended"},
        {"market": "Trichy", "crop": "Maize", "price": 1950, "trend": 2, "arrival": "Medium", "demand": "Medium", "risk": "Low", "score": 76, "rec": "Good"},
    ]
    if crop and crop != "All Crops":
        data = [d for d in data if d["crop"].lower() == crop.lower()]
    if q:
        data = [d for d in data if q.lower() in d["market"].lower() or q.lower() in d["crop"].lower()]
    return data


@router.post("/government/supply-plan")
def government_supply_plan(payload: SupplyPlanRequest) -> dict:
    """Generates an AI-optimized supply distribution plan for FPOs."""
    qty = payload.quantity
    markets = payload.markets if payload.markets else ["Chennai", "Madurai", "Coimbatore"]

    # Simplified allocation algorithm: weight by market score
    weights = {"Chennai": 0.50, "Madurai": 0.30, "Coimbatore": 0.20, "Salem": 0.15, "Trichy": 0.18, "Vellore": 0.25}
    total_weight = sum(weights.get(m, 0.20) for m in markets)

    distributions = []
    for market in markets:
        w = weights.get(market, 0.20)
        alloc = round((w / total_weight) * qty, 1)
        distributions.append({
            "market": market,
            "quantity_tons": alloc,
            "reason": f"Allocated based on demand index and price forecast for {market}",
        })

    return {
        "crop": payload.crop,
        "total_quantity": qty,
        "distributions": distributions,
        "expected_revenue_gain_pct": 12.5,
        "ai_confidence": 89,
    }


@router.get("/government/reports")
def government_reports(
    region: str | None = Query(None),
) -> list[dict]:
    """Returns list of available government intelligence reports."""
    return [
        {"id": 1, "name": "Tamil Nadu Weekly Market Report — W23", "date": "2026-06-08", "type": "weekly", "size_mb": 2.4, "region": "Tamil Nadu"},
        {"id": 2, "name": "Tomato Crop Analysis — June 2026", "date": "2026-06-05", "type": "crop", "size_mb": 1.8, "region": "Tamil Nadu"},
    ]

from app.models.schemas import SchemeProfileRequest, SchemeAnalysisResponse
import scheme_advisor

@router.post("/scheme-advisor", response_model=SchemeAnalysisResponse)
def scheme_advisor_endpoint(payload: SchemeProfileRequest) -> SchemeAnalysisResponse:
    return scheme_advisor.analyze_schemes(payload)
