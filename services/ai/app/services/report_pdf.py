from __future__ import annotations

from datetime import datetime, timezone
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.data.store import get_store
from app.intelligence.engines import DecisionEngine, ForecastEngine, RiskEngine


def _engines() -> tuple[DecisionEngine, ForecastEngine, RiskEngine]:
    store = get_store()
    forecaster = ForecastEngine(store)
    decision = DecisionEngine(store, forecaster)
    risk = RiskEngine(store, forecaster)
    return decision, forecaster, risk


def _inr(value: float) -> str:
    return f"Rs.{value:,.0f}"


def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Heading1"],
            fontSize=18,
            spaceAfter=6,
            textColor=colors.HexColor("#1a6641"),
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["Normal"],
            fontSize=10,
            textColor=colors.grey,
            spaceAfter=14,
        ),
        "heading": ParagraphStyle(
            "Section",
            parent=base["Heading2"],
            fontSize=12,
            spaceBefore=12,
            spaceAfter=6,
            textColor=colors.HexColor("#1a6641"),
        ),
        "body": ParagraphStyle("Body", parent=base["Normal"], fontSize=9, leading=12),
    }


def _table(data: list[list], col_widths: list[float] | None = None) -> Table:
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a6641")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f6f8f7")]),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return t


def generate_report_pdf(commodity: str, report_type: str = "full") -> bytes:
    """Build a PDF report with live mandi prices, AI forecasts, and recommendations."""
    decision, forecaster, risk_engine = _engines()
    store = decision.store
    styles = _styles()
    quality_score = store.data_quality_score()
    price_rows = int(store._quality.get("prices_rows", 0))
    commodities = store.commodities()

    ranked = decision.rank_markets(commodity, limit=20)
    recommendation = decision.recommend(commodity)
    best = ranked[0] if ranked else None

    fc: dict = {}
    risk: dict = {"metrics": [], "action": {"immediate": "N/A", "monitor": "N/A"}}
    if best:
        fc = forecaster.forecast(commodity, best["name"], best["state"])
        risk = risk_engine.analyze(commodity, best["name"], best["state"])

    now = datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M UTC")
    titles = {
        "market": "Weekly Market Intelligence Report",
        "forecast": "Price Forecast & AI Outlook Report",
        "risk": "Risk Assessment Report",
        "supply": "Commodity Supply & Coverage Report",
        "full": "SmartAg Market Intelligence Report",
    }
    title = titles.get(report_type, titles["full"])

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.6 * inch,
        leftMargin=0.6 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
    )
    story: list = []

    story.append(Paragraph("SmartAg Ops", styles["title"]))
    story.append(Paragraph(title, styles["heading"]))
    story.append(
        Paragraph(
            f"Generated {now} · Data quality {quality_score:.1f}% · "
            f"{price_rows:,} APMC price records",
            styles["subtitle"],
        )
    )

    # ── All-crops summary (market, supply, full) ─────────────────────
    if report_type in ("market", "supply", "full"):
        story.append(Paragraph("Commodity price overview (APMC dataset)", styles["heading"]))
        crop_rows = [
            ["Crop", "Mandis", "Avg price/q", "Best price/q", "Best mandi", "State"],
        ]
        for c in commodities:
            crop_rows.append(
                [
                    c["name"],
                    str(c.get("market_count", 0)),
                    _inr(c.get("avg_price", 0)),
                    _inr(c.get("best_price", 0)),
                    (c.get("best_market") or "")[:28],
                    c.get("best_state") or "",
                ]
            )
        story.append(_table(crop_rows, [1.1 * inch, 0.55 * inch, 0.85 * inch, 0.85 * inch, 1.5 * inch, 0.9 * inch]))
        story.append(Spacer(1, 12))

    if not best:
        story.append(Paragraph(f"No mandi data available for {commodity}.", styles["body"]))
        doc.build(story)
        return buffer.getvalue()

    # ── AI recommendation ───────────────────────────────────────────
    if report_type in ("market", "forecast", "full"):
        story.append(Paragraph(f"AI recommendation · {commodity}", styles["heading"]))
        rec_rows = [
            ["Field", "Value"],
            ["Headline", recommendation["headline"]],
            ["Recommended mandi", f"{recommendation['market']}, {recommendation['state']}"],
            ["Sell / Hold", f"Sell {recommendation['sell_pct']}% · Hold {recommendation['hold_pct']}% · {recommendation['hold_days']} days"],
            ["Expected revenue", _inr(recommendation["expected_revenue"])],
            ["AI confidence", f"{recommendation['confidence']}%"],
            ["Overall risk", best["risk"]],
        ]
        story.append(_table(rec_rows, [1.6 * inch, 4.6 * inch]))
        if recommendation.get("insights"):
            story.append(Spacer(1, 6))
            story.append(Paragraph("Key insights:", styles["body"]))
            for insight in recommendation["insights"][:5]:
                story.append(Paragraph(f"• {insight}", styles["body"]))
        story.append(Spacer(1, 10))

    # ── Mandi price table ───────────────────────────────────────────
    if report_type in ("market", "full"):
        story.append(Paragraph(f"Mandi prices · {commodity} (ranked by AI score)", styles["heading"]))
        mandi_rows = [
            ["#", "Mandi", "State", "District", "Price/q", "7d %", "Demand", "Risk", "AI"],
        ]
        for i, m in enumerate(ranked, start=1):
            mandi_rows.append(
                [
                    str(i),
                    m["name"][:22],
                    m["state"][:14],
                    m["district"][:16],
                    _inr(m["price"]),
                    f"{m['forecast']:+.1f}%",
                    m["demand"],
                    m["risk"],
                    m["recommendation"],
                ]
            )
        story.append(
            _table(
                mandi_rows,
                [0.3 * inch, 1.2 * inch, 0.75 * inch, 0.85 * inch, 0.75 * inch, 0.5 * inch, 0.55 * inch, 0.5 * inch, 0.45 * inch],
            )
        )
        story.append(Spacer(1, 12))

    # ── Price forecast ──────────────────────────────────────────────
    if report_type in ("forecast", "full") and fc:
        story.append(
            Paragraph(
                f"7-day price forecast · {best['name']}, {best['state']} · {fc.get('model', 'ML')}",
                styles["heading"],
            )
        )
        fc_summary = [
            ["Metric", "Value"],
            ["Spot (last modal)", _inr(fc.get("last_price", best["price"]))],
            ["Tomorrow", _inr(fc.get("tomorrow", 0))],
            ["Day +3", _inr(fc.get("day3", 0))],
            ["Day +7", _inr(fc.get("day7", 0))],
            ["7-day trend", f"{fc.get('trend_pct', 0):+.1f}%"],
            ["Signal", fc.get("signal", "Neutral")],
            ["Model accuracy", f"{fc.get('accuracy', 0):.1f}%"],
        ]
        story.append(_table(fc_summary, [1.8 * inch, 4.4 * inch]))

        points = fc.get("points") or []
        if points:
            story.append(Spacer(1, 8))
            story.append(Paragraph("Daily forecast points", styles["body"]))
            pt_rows = [["Day", "Actual/q", "Predicted/q", "Lower/q", "Upper/q"]]
            for p in points:
                pt_rows.append(
                    [
                        p["day"],
                        _inr(p["actual"]) if p.get("actual") is not None else "—",
                        _inr(p["predicted"]) if p.get("predicted") is not None else "—",
                        _inr(p["lower"]) if p.get("lower") is not None else "—",
                        _inr(p["upper"]) if p.get("upper") is not None else "—",
                    ]
                )
            story.append(_table(pt_rows, [1.0 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch]))
        story.append(Spacer(1, 12))

    # ── Risk assessment ─────────────────────────────────────────────
    if report_type in ("risk", "full") and risk.get("metrics"):
        story.append(Paragraph(f"Risk assessment · {commodity}", styles["heading"]))
        risk_rows = [["Risk factor", "Score", "Level", "7d change"]]
        for m in risk["metrics"]:
            risk_rows.append([m["name"], f"{m['value']}/100", m["level"], m["delta"]])
        story.append(_table(risk_rows, [2.2 * inch, 0.9 * inch, 0.9 * inch, 1.2 * inch]))

        action = risk.get("action") or {}
        if isinstance(action, dict):
            story.append(Spacer(1, 8))
            story.append(Paragraph(f"Immediate: {action.get('immediate', '')}", styles["body"]))
            story.append(Paragraph(f"Monitor: {action.get('monitor', '')}", styles["body"]))

        timeline = risk.get("timeline") or []
        if timeline:
            story.append(Spacer(1, 8))
            story.append(Paragraph("7-day risk timeline", styles["body"]))
            tl_rows = [["Date", "Volatility", "Arrival", "Weather", "Transport"]]
            for row in timeline:
                tl_rows.append(
                    [
                        row["day"],
                        str(row["price"]),
                        str(row["arrival"]),
                        str(row["weather"]),
                        str(row["transport"]),
                    ]
                )
            story.append(_table(tl_rows, [0.9 * inch, 0.9 * inch, 0.9 * inch, 0.9 * inch, 0.9 * inch]))

    story.append(Spacer(1, 16))
    story.append(
        Paragraph(
            "Disclaimer: Predictions use historical APMC modal prices and GradientBoostingRegressor forecasts. "
            "Validate against local mandi conditions before trading decisions.",
            styles["body"],
        )
    )

    doc.build(story)
    return buffer.getvalue()
