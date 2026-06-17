from __future__ import annotations

import json
import logging

import google.generativeai as genai

from app.core.config import settings
from app.data.store import get_store
from app.intelligence.engines import DecisionEngine, ForecastEngine, RiskEngine

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are SmartAg AI Advisor — an agricultural market intelligence assistant for Indian APMC mandis.

Rules:
- Answer ONLY using the LIVE INTELLIGENCE DATA provided below. Do not invent prices, markets, or forecasts.
- The data block includes `available_commodities` — only those crops have APMC price records.
- Use clear markdown: headings, bullet lists, and tables when comparing markets.
- Be concise, actionable, and farmer-friendly. Use ₹ for prices and /q for per quintal.
- If the user asks about a crop not in `available_commodities`, say so and list what is available.
- Never claim to use GPT or OpenAI — you are powered by Gemini with SmartAg's ML engines."""


class AdvisoryService:
    """Gemini-powered advisory layer with retrieval from live intelligence engines."""

    def __init__(self) -> None:
        store = get_store()
        self.forecaster = ForecastEngine(store)
        self.decision = DecisionEngine(store, self.forecaster)
        self.risk = RiskEngine(store, self.forecaster)
        self.store = store
        self._gemini_model = self._init_gemini()

    def _init_gemini(self):
        if not settings.gemini_api_key:
            return None
        try:
            genai.configure(api_key=settings.gemini_api_key)
            return genai.GenerativeModel(
                settings.gemini_model,
                system_instruction=SYSTEM_PROMPT,
            )
        except Exception:
            logger.exception("Failed to initialize Gemini client")
            return None

    def answer(self, message: str, commodity: str | None = None, state: str | None = None) -> dict:
        available = self.store.commodity_names()
        available_set = set(available)
        from_message = self.store._match_commodity_in_text(message, available, available_set)
        unsupported = self.store.unsupported_crop_in_message(message)

        if unsupported and not from_message:
            crop_list = ", ".join(available)
            return {
                "reply": (
                    f"**{unsupported}** is not in the current APMC price dataset.\n\n"
                    f"**Available crops ({len(available)}):** {crop_list}\n\n"
                    "Pick one of these crops, or ask a question mentioning a supported crop by name."
                ),
                "confidence": 40,
                "sources": ["APMC price dataset"],
                "commodity": None,
            }

        if from_message:
            commodity = from_message
        elif commodity:
            commodity = self.store.resolve_commodity("", commodity) or settings.default_commodity
        else:
            commodity = settings.default_commodity

        ranked = self.decision.rank_markets(commodity, state, limit=5)
        recommendation = self.decision.recommend(commodity, state)

        if not ranked:
            crop_list = ", ".join(available)
            return {
                "reply": (
                    f"I couldn't find validated APMC records for **{commodity}**.\n\n"
                    f"**Available crops in the dataset ({len(available)}):** {crop_list}\n\n"
                    "Note: Tomato, Onion, and Potato are not in the current APMC dataset."
                ),
                "confidence": 40,
                "sources": ["APMC price dataset"],
                "commodity": None,
            }

        best = ranked[0]
        risk = self.risk.analyze(commodity, best["name"], best["state"])
        fc = self.forecaster.forecast(commodity, best["name"], best["state"])
        context = self._build_context(commodity, state, ranked, recommendation, best, fc, risk, available)

        if self._gemini_model:
            reply = self._ask_gemini(message, context)
            if reply:
                return {
                    "reply": reply,
                    "confidence": recommendation["confidence"],
                    "sources": [
                        "agmarknet_india_historical_prices_2024_2025.csv",
                        "india_2000_2024_daily_weather.csv",
                        "GradientBoostingRegressor forecast",
                        f"Google {settings.gemini_model}",
                    ],
                    "commodity": commodity,
                }

        result = self._rule_based_answer(message, commodity, ranked, recommendation, best, fc, risk)
        result["commodity"] = commodity
        return result

    def _build_context(
        self,
        commodity: str,
        state: str | None,
        ranked: list,
        recommendation: dict,
        best: dict,
        fc: dict,
        risk: dict,
        available: list[str],
    ) -> str:
        payload = {
            "commodity": commodity,
            "available_commodities": available,
            "filter_state": state,
            "recommendation": recommendation,
            "top_market": best,
            "forecast": fc,
            "risk": risk,
            "ranked_markets": ranked,
        }
        return json.dumps(payload, indent=2, default=str)

    def _ask_gemini(self, message: str, context: str) -> str | None:
        prompt = f"LIVE INTELLIGENCE DATA:\n```json\n{context}\n```\n\nUSER QUESTION:\n{message}"
        try:
            response = self._gemini_model.generate_content(prompt)
            text = (response.text or "").strip()
            return text or None
        except Exception:
            logger.exception("Gemini request failed")
            return None

    def _rule_based_answer(
        self,
        message: str,
        commodity: str,
        ranked: list,
        recommendation: dict,
        best: dict,
        fc: dict,
        risk: dict,
    ) -> dict:
        lower = message.lower()
        if any(k in lower for k in ["where", "sell", "market", "mandi"]):
            reply = self._sell_advice(commodity, recommendation, best, fc, risk)
        elif any(k in lower for k in ["price", "forecast", "predict", "week"]):
            reply = self._forecast_advice(commodity, best, fc)
        elif any(k in lower for k in ["risk", "weather", "delay", "volatility"]):
            reply = self._risk_advice(commodity, best, risk)
        elif any(k in lower for k in ["compare", "vs", "versus"]):
            reply = self._compare_advice(commodity, ranked[:3])
        elif any(k in lower for k in ["wait", "hold", "timing"]):
            reply = self._timing_advice(recommendation, fc)
        else:
            reply = self._general_advice(commodity, recommendation, best, fc, risk)

        return {
            "reply": reply,
            "confidence": recommendation["confidence"],
            "sources": [
                "agmarknet_india_historical_prices_2024_2025.csv",
                "india_2000_2024_daily_weather.csv",
                "GradientBoostingRegressor forecast",
            ],
        }

    def _sell_advice(self, commodity, rec, best, fc, risk) -> str:
        return (
            f"**Recommended market: {rec['market']} ({rec['state']})**\n\n"
            f"| Metric | Value |\n|--------|-------|\n"
            f"| Modal price | ₹{best['price']:,.0f}/q |\n"
            f"| 7-day forecast | ₹{fc['day7']:,.0f}/q ({fc['signal']}) |\n"
            f"| Confidence | {rec['confidence']}% |\n"
            f"| Risk | {best['risk']} |\n\n"
            f"**Action:** {rec['headline']}\n\n"
            f"**Key factors:**\n"
            + "\n".join(f"- {i}" for i in rec["insights"][:3])
            + f"\n\n**Risk note:** {risk['action']['immediate'] if isinstance(risk['action'], dict) else risk['action']}"
        )

    def _forecast_advice(self, commodity, best, fc) -> str:
        return (
            f"**{commodity} price outlook — {best['name']}**\n\n"
            f"- Tomorrow: **₹{fc['tomorrow']:,.0f}/q**\n"
            f"- Day 3: **₹{fc['day3']:,.0f}/q**\n"
            f"- Day 7: **₹{fc['day7']:,.0f}/q**\n"
            f"- Model accuracy: **{fc['accuracy']:.1f}%**\n"
            f"- Signal: **{fc['signal']}** ({fc['trend_pct']:+.1f}% vs spot)\n\n"
            "Forecast uses gradient boosting on historical APMC modal prices with lag, rolling mean, and momentum features."
        )

    def _risk_advice(self, commodity, best, risk) -> str:
        lines = "\n".join(f"- **{m['name']}**: {m['value']}/100 ({m['level']})" for m in risk["metrics"])
        action_text = risk["action"]["immediate"] if isinstance(risk["action"], dict) else risk["action"]
        return f"**Risk assessment for {commodity} at {best['name']}**\n\n{lines}\n\n**Action:** {action_text}"

    def _compare_advice(self, commodity, ranked) -> str:
        rows = "\n".join(
            f"| {m['name']} | ₹{m['price']:,.0f} | {m['forecast']:+.1f}% | {m['risk']} | {m['recommendation']} |"
            for m in ranked
        )
        return (
            f"**Top markets for {commodity}**\n\n"
            f"| Market | Price | 7d | Risk | Status |\n|--------|-------|----|------|--------|\n"
            f"{rows}"
        )

    def _timing_advice(self, rec, fc) -> str:
        if fc["trend_pct"] > 1.5:
            return (
                f"Holding is supported. Forecast shows **{fc['trend_pct']:+.1f}%** upside over 7 days.\n\n"
                f"Suggested split: sell **{rec['sell_pct']}%** now, hold **{rec['hold_pct']}%** for **{rec['hold_days']}** days."
            )
        return (
            f"Near-term upside is limited ({fc['trend_pct']:+.1f}%). "
            f"Recommend executing **{rec['sell_pct']}%** of inventory at current modal prices."
        )

    def _general_advice(self, commodity, rec, best, fc, risk) -> str:
        return (
            f"**SmartAg intelligence summary — {commodity}**\n\n"
            f"- Best market: **{rec['market']}** ({rec['state']})\n"
            f"- Spot: **₹{best['price']:,.0f}/q** · 7d target: **₹{fc['day7']:,.0f}/q**\n"
            f"- Confidence: **{rec['confidence']}%** · Risk: **{best['risk']}**\n"
            f"- Recommendation: {rec['headline']}\n\n"
            "Ask about prices, markets, risk, or timing for deeper analysis."
        )
