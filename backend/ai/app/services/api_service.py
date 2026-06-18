from __future__ import annotations

from datetime import datetime, timezone

from app.core.config import settings
from app.data.store import get_store
from app.intelligence.engines import DecisionEngine, ForecastEngine, RiskEngine
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
    RiskAction,
    RiskResponse,
)
from app.services.advisory import AdvisoryService


def _engines() -> tuple[DecisionEngine, ForecastEngine, RiskEngine]:
    store = get_store()
    forecaster = ForecastEngine(store)
    decision = DecisionEngine(store, forecaster)
    risk = RiskEngine(store, forecaster)
    return decision, forecaster, risk


def get_data_quality() -> DataQualityResponse:
    store = get_store()
    return DataQualityResponse(
        overall_score=store.data_quality_score(),
        ingestion="Active",
        validation="Passed",
        forecast_engine="Running",
        decision_engine="Online",
        records={
            "prices": int(store._quality.get("prices_rows", 0)),
            "production": int(store._quality.get("production_rows", 0)),
            "weather": int(store._quality.get("weather_rows", 0)),
        },
        last_updated=datetime.now(timezone.utc),
    )


def get_health() -> HealthResponse:
    store = get_store()
    return HealthResponse(
        status="ok",
        version="1.0.0",
        datasets_loaded=store.loaded,
        data_quality_score=store.data_quality_score(),
    )


def get_dashboard(commodity: str | None = None, state: str | None = None) -> DashboardResponse:
    store = get_store()
    commodity = commodity or settings.default_commodity
    decision, forecaster, risk_engine = _engines()

    ranked = decision.rank_markets(commodity, state, limit=8)
    recommendation = decision.recommend(commodity, state)
    best = ranked[0] if ranked else None

    fc = (
        forecaster.forecast(commodity, best["name"], best["state"])
        if best
        else {"points": [], "accuracy": 0, "day7": 0, "tomorrow": 0, "day3": 0, "trend_pct": 0, "signal": "Neutral"}
    )
    risks = risk_engine.analyze(commodity, best["name"], best["state"]) if best else {"metrics": []}

    kpis = {
        "crop": commodity,
        "location": state or (best["state"] if best else "India"),
        "recommended_market": f"{recommendation['market']} {recommendation['state']}" if best else "N/A",
        "expected_price": float(best["price"]) if best else 0,
        "expected_profit": float(recommendation["expected_revenue"]),
        "confidence": int(recommendation["confidence"]),
        "risk": ranked[0]["risk"] if ranked else "Medium",
    }

    tickers = []
    for c in ["Wheat", "Mustard", "Maize"]:
        snap = store.latest_market_snapshot(c, top_n=1)
        if not snap.empty:
            row = snap.iloc[0]
            series = store.market_series(c, row["market"], row["state"])
            trend = 0.0
            if len(series) >= 2:
                trend = (series["modal_price"].iloc[-1] - series["modal_price"].iloc[-2]) / series["modal_price"].iloc[-2] * 100
            tickers.append(
                {
                    "label": c.upper().split()[0],
                    "price": f"₹{row['modal_price']:,.0f}",
                    "delta": f"{trend:+.1f}%",
                    "up": trend >= 0,
                }
            )

    return DashboardResponse(
        kpis=kpis,
        recommendation={
            **recommendation,
            "updated_at": datetime.now(timezone.utc),
        },
        forecast=fc["points"],
        markets=[MarketRow(**m) for m in ranked],
        risks=risks["metrics"],
        data_quality=get_data_quality(),
        tickers=tickers,
    )


def get_markets(commodity: str, state: str | None = None, q: str | None = None) -> list[MarketRow]:
    decision, _, _ = _engines()
    ranked = decision.rank_markets(commodity, state, limit=20)
    if q:
        q_lower = q.lower()
        ranked = [m for m in ranked if q_lower in m["name"].lower() or q_lower in m["state"].lower()]
    return [MarketRow(**m) for m in ranked]


def get_forecast(commodity: str, market: str, state: str) -> ForecastResponse:
    store = get_store()
    _, forecaster, _ = _engines()
    fc = forecaster.forecast(commodity, market, state)
    series = store.market_series(commodity, market, state)
    history_days = int(len(series))
    return ForecastResponse(
        commodity=commodity,
        market=market,
        state=state,
        accuracy=fc["accuracy"],
        signal=fc["signal"],
        points=fc["points"],
        tomorrow=fc["tomorrow"],
        day3=fc["day3"],
        day7=fc["day7"],
        last_price=fc.get("last_price", 0),
        trend_pct=fc.get("trend_pct", 0),
        model=fc.get("model", "GradientBoostingRegressor"),
        history_days=history_days,
        attribution=[
            f"{history_days} daily APMC modal price records for {market}, {state}",
            "GradientBoostingRegressor on lag-1/7, rolling means, momentum, day-of-week",
            "3% confidence band from model prediction variance",
            "State/national price fallback when mandi history is sparse",
        ],
    )


def get_risk(commodity: str, market: str | None = None, state: str | None = None) -> RiskResponse:
    decision, _, risk_engine = _engines()
    ranked = decision.rank_markets(commodity, state, limit=1)
    if not ranked:
        return RiskResponse(
            commodity=commodity,
            market=market or "",
            state=state or "",
            metrics=[],
            timeline=[],
            explanation=[],
            action=RiskAction(
                immediate="No APMC data available for this crop.",
                monitor="Select a crop with live mandi records.",
            ),
        )
    best = ranked[0]
    market = market or best["name"]
    state = state or best["state"]
    result = risk_engine.analyze(commodity, market, state)
    return RiskResponse(commodity=commodity, market=market, state=state, **result)


def get_commodities() -> list[CommodityInfo]:
    store = get_store()
    return [CommodityInfo(**c) for c in store.commodities()]


def get_reports() -> list[ReportRow]:
    store = get_store()
    if not store.loaded or store.prices.empty:
        return []

    latest_date = store.prices["price_date"].max().strftime("%b %d, %Y")
    price_rows = int(store._quality.get("prices_rows", 0))
    prod_rows = int(store._quality.get("production_rows", 0))
    weather_rows = int(store._quality.get("weather_rows", 0))
    commodities = store.commodity_names()

    def _size(rows: int) -> str:
        if rows >= 1_000_000:
            return f"{rows / 1_000_000:.1f} MB"
        if rows >= 100_000:
            return f"{rows / 100_000:.1f} MB"
        return f"{max(1, rows // 1000)} KB"

    return [
        ReportRow(
            name=f"Weekly Market Report · {len(commodities)} crops",
            type="Market",
            date=latest_date,
            size=_size(price_rows),
            report_type="market",
        ),
        ReportRow(
            name="Forecast Accuracy Report · GradientBoosting",
            type="Forecast",
            date=latest_date,
            size=_size(price_rows // 20),
            report_type="forecast",
        ),
        ReportRow(
            name="Risk Summary · Volatility & weather",
            type="Risk",
            date=latest_date,
            size=_size(weather_rows),
            report_type="risk",
        ),
        ReportRow(
            name="Production Intelligence · State yields",
            type="Supply",
            date=latest_date,
            size=_size(prod_rows),
            report_type="supply",
        ),
    ]


def get_report_pdf(commodity: str, report_type: str = "full") -> bytes:
    from app.services.report_pdf import generate_report_pdf

    return generate_report_pdf(commodity, report_type)


def post_advisor(payload: AdvisorRequest) -> AdvisorResponse:
    svc = AdvisoryService()
    result = svc.answer(payload.message, payload.commodity, payload.state)
    return AdvisorResponse(**result)
