from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


RiskLevel = Literal["Low", "Medium", "High"]
RecommendationLevel = Literal["BEST", "GOOD", "FAIR", "AVOID"]


class HealthResponse(BaseModel):
    status: str
    version: str
    datasets_loaded: bool
    data_quality_score: float


class DataQualityResponse(BaseModel):
    overall_score: float
    ingestion: str
    validation: str
    forecast_engine: str
    decision_engine: str
    records: dict[str, int]
    last_updated: datetime


class KpiResponse(BaseModel):
    crop: str
    location: str
    recommended_market: str
    expected_price: float
    expected_profit: float
    confidence: int
    risk: RiskLevel


class MarketRow(BaseModel):
    name: str
    state: str
    district: str
    distance: int
    price: float
    forecast: float
    demand: str
    risk: RiskLevel
    recommendation: RecommendationLevel
    score: float
    lat: float
    lng: float


class ForecastPoint(BaseModel):
    day: str
    actual: float | None = None
    predicted: float | None = None
    lower: float | None = None
    upper: float | None = None


class ForecastResponse(BaseModel):
    commodity: str
    market: str
    state: str
    accuracy: float
    signal: str
    points: list[ForecastPoint]
    tomorrow: float
    day3: float
    day7: float
    last_price: float = 0
    trend_pct: float = 0
    model: str = "GradientBoostingRegressor"
    history_days: int = 0
    attribution: list[str]


class RiskMetric(BaseModel):
    name: str
    level: RiskLevel
    value: int
    delta: str


class RiskTimelinePoint(BaseModel):
    day: str
    price: int
    arrival: int
    weather: int
    transport: int


class RiskAction(BaseModel):
    immediate: str
    monitor: str


class RiskResponse(BaseModel):
    commodity: str = ""
    market: str = ""
    state: str = ""
    metrics: list[RiskMetric]
    timeline: list[RiskTimelinePoint]
    explanation: list[str]
    action: RiskAction


class RecommendationResponse(BaseModel):
    headline: str
    market: str
    state: str
    sell_pct: int
    hold_pct: int
    hold_days: int
    expected_revenue: float
    confidence: int
    insights: list[str]
    updated_at: datetime


class DashboardResponse(BaseModel):
    kpis: KpiResponse
    recommendation: RecommendationResponse
    forecast: list[ForecastPoint]
    markets: list[MarketRow]
    risks: list[RiskMetric]
    data_quality: DataQualityResponse
    tickers: list[dict[str, str | float | bool]]


class AdvisorMessage(BaseModel):
    role: Literal["user", "ai"]
    text: str


class AdvisorRequest(BaseModel):
    message: str
    commodity: str | None = None
    state: str | None = None


class AdvisorResponse(BaseModel):
    reply: str
    confidence: int
    sources: list[str]
    commodity: str | None = None


class ReportRow(BaseModel):
    name: str
    type: str
    date: str
    size: str
    report_type: str = "full"


class CommodityInfo(BaseModel):
    name: str
    record_count: int
    states: list[str]
    market_count: int = 0
    avg_price: float = 0
    best_price: float = 0
    best_market: str = ""
    best_state: str = ""
