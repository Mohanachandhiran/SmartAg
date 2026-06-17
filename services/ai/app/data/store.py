from __future__ import annotations

import hashlib
from datetime import datetime
from functools import lru_cache
from pathlib import Path

import numpy as np
import pandas as pd

from app.core.config import settings


def _parse_price_date(value: str) -> pd.Timestamp:
    return pd.to_datetime(value.strip(), format="%d %b %Y", errors="coerce")


class DataStore:
    """Loads, validates, and caches agricultural datasets."""

    def __init__(self) -> None:
        self._prices: pd.DataFrame | None = None
        self._production: pd.DataFrame | None = None
        self._weather: pd.DataFrame | None = None
        self._quality: dict[str, float | int] = {}

    @property
    def loaded(self) -> bool:
        return self._prices is not None

    def load(self) -> None:
        if self.loaded:
            return

        cache_prices = settings.cache_dir / "prices.parquet"
        cache_production = settings.cache_dir / "production.parquet"
        cache_weather = settings.cache_dir / "weather.parquet"

        if cache_prices.exists() and cache_production.exists() and cache_weather.exists():
            self._prices = pd.read_parquet(cache_prices)
            self._production = pd.read_parquet(cache_production)
            self._weather = pd.read_parquet(cache_weather)
            self._quality = {
                "prices_rows": len(self._prices),
                "production_rows": len(self._production),
                "weather_rows": len(self._weather),
                "prices_valid_pct": round(self._prices["modal_price"].notna().mean() * 100, 1),
                "weather_valid_pct": round(self._weather["precipitation_sum"].notna().mean() * 100, 1),
                "prices_dropped_pct": 0.0,
            }
            return

        prices_path = settings.datasets_dir / settings.prices_file
        production_path = settings.datasets_dir / settings.production_file
        weather_path = settings.datasets_dir / settings.weather_file

        prices = self._clean_prices(pd.read_csv(prices_path))
        production = self._clean_production(pd.read_csv(production_path))
        weather = self._clean_weather(pd.read_csv(weather_path))

        prices.to_parquet(cache_prices, index=False)
        production.to_parquet(cache_production, index=False)
        weather.to_parquet(cache_weather, index=False)

        self._prices = prices
        self._production = production
        self._weather = weather
        self._quality = {
            "prices_rows": len(prices),
            "production_rows": len(production),
            "weather_rows": len(weather),
            "prices_valid_pct": round(prices["modal_price"].notna().mean() * 100, 1),
            "weather_valid_pct": round(weather["precipitation_sum"].notna().mean() * 100, 1),
        }

    def _clean_prices(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.rename(
            columns={
                "District Name": "district",
                "Market Name": "market",
                "Commodity": "commodity",
                "Variety": "variety",
                "Grade": "grade",
                "Min Price (Rs./Quintal)": "min_price",
                "Max Price (Rs./Quintal)": "max_price",
                "Modal Price (Rs./Quintal)": "modal_price",
                "Price Date": "price_date_raw",
                "State": "state",
            }
        )
        df["price_date"] = pd.to_datetime(df["price_date_raw"].str.strip(), format="%d %b %Y", errors="coerce")
        for col in ("min_price", "max_price", "modal_price"):
            df[col] = pd.to_numeric(df[col], errors="coerce")

        before = len(df)
        df = df.dropna(subset=["price_date", "modal_price", "commodity", "market", "state"])
        df = df[df["modal_price"] > 0]
        df = df.sort_values("price_date")

        # Fast anomaly clip per commodity (global percentiles)
        for comm, group in df.groupby("commodity"):
            lo, hi = group["modal_price"].quantile([0.01, 0.99])
            mask = (df["commodity"] == comm) & ((df["modal_price"] < lo) | (df["modal_price"] > hi))
            df = df[~mask]

        df["market_key"] = df["market"] + " · " + df["state"]
        self._quality["prices_dropped_pct"] = round((1 - len(df) / before) * 100, 2)
        return df.reset_index(drop=True)

    def _clean_production(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.rename(
            columns={
                "State": "state",
                "District": "district",
                "Crop": "crop",
                "Year": "year",
                "Season": "season",
                "Area": "area",
                "Production": "production",
                "Yield": "yield",
            }
        )
        df["area"] = pd.to_numeric(df["area"], errors="coerce")
        df["production"] = pd.to_numeric(df["production"], errors="coerce")
        df["yield"] = pd.to_numeric(df["yield"], errors="coerce")
        return df.dropna(subset=["crop", "state"])

    def _clean_weather(self, df: pd.DataFrame) -> pd.DataFrame:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        for col in (
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "rain_sum",
            "wind_speed_10m_max",
        ):
            df[col] = pd.to_numeric(df[col], errors="coerce")
        return df.dropna(subset=["city", "date"])

    @property
    def prices(self) -> pd.DataFrame:
        self.load()
        assert self._prices is not None
        return self._prices

    @property
    def production(self) -> pd.DataFrame:
        self.load()
        assert self._production is not None
        return self._production

    @property
    def weather(self) -> pd.DataFrame:
        self.load()
        assert self._weather is not None
        return self._weather

    def commodities(self) -> list[dict]:
        df = self.prices
        latest = (
            df.sort_values("price_date")
            .groupby(["commodity", "market", "state", "district"], as_index=False)
            .tail(1)
        )
        summaries: list[dict] = []
        for commodity, group in latest.groupby("commodity"):
            best_idx = group["modal_price"].idxmax()
            best = group.loc[best_idx]
            summaries.append(
                {
                    "name": commodity,
                    "record_count": int((df["commodity"] == commodity).sum()),
                    "states": sorted(group["state"].unique().tolist())[:10],
                    "market_count": int(len(group)),
                    "avg_price": round(float(group["modal_price"].mean()), 0),
                    "best_price": round(float(best["modal_price"]), 0),
                    "best_market": str(best["market"]),
                    "best_state": str(best["state"]),
                }
            )
        summaries.sort(key=lambda item: item["record_count"], reverse=True)
        return summaries

    def commodity_names(self) -> list[str]:
        return [c["name"] for c in self.commodities()]

    def resolve_commodity(self, message: str = "", hint: str | None = None) -> str | None:
        names = self.commodity_names()
        name_set = set(names)

        matched = self._match_commodity_in_text(message, names, name_set)
        if matched:
            return matched

        if hint:
            for name in names:
                if name.lower() == hint.lower():
                    return name

        return None

    def _match_commodity_in_text(self, text: str, names: list[str], name_set: set[str]) -> str | None:
        lower = text.lower()
        for name in sorted(names, key=len, reverse=True):
            if name.lower() in lower:
                return name
            if "(" in name:
                for part in name.replace(")", "").split("("):
                    part = part.strip()
                    if len(part) > 3 and part.lower() in lower:
                        return name

        aliases = {
            "wheat": "Wheat",
            "mustard": "Mustard",
            "soyabean": "Soyabean",
            "soybean": "Soyabean",
            "maize": "Maize",
            "corn": "Maize",
            "brinjal": "Brinjal",
            "eggplant": "Brinjal",
            "chilli": "Green Chilli",
            "chili": "Green Chilli",
            "bhindi": "Bhindi(Ladies Finger)",
            "okra": "Bhindi(Ladies Finger)",
            "cauliflower": "Cauliflower",
            "cabbage": "Cabbage",
            "ginger": "Ginger(Green)",
            "apple": "Apple",
            "garlic": "Garlic",
            "carrot": "Carrot",
            "banana": "Banana",
            "bajra": "Bajra(Pearl Millet/Cumbu)",
            "pearl millet": "Bajra(Pearl Millet/Cumbu)",
            "masur": "Lentil (Masur)(Whole)",
            "lentil": "Lentil (Masur)(Whole)",
            "jaggery": "Gur(Jaggery)",
            "gur": "Gur(Jaggery)",
            "groundnut": "Groundnut",
            "peanut": "Groundnut",
            "cotton": "Cotton",
            "moong": "Green Gram (Moong)(Whole)",
            "arhar": "Arhar (Tur/Red Gram)(Whole)",
            "tur dal": "Arhar (Tur/Red Gram)(Whole)",
            "mango": "Mango",
            "jowar": "Jowar(Sorghum)",
            "sorghum": "Jowar(Sorghum)",
        }
        for alias, name in sorted(aliases.items(), key=lambda x: len(x[0]), reverse=True):
            if alias in lower and name in name_set:
                return name

        return None

    _UNSUPPORTED_CROPS = (
        "tomato",
        "onion",
        "potato",
        "rice",
        "paddy",
        "sugarcane",
        "turmeric",
        "coriander",
    )

    def unsupported_crop_in_message(self, message: str) -> str | None:
        lower = message.lower()
        for crop in self._UNSUPPORTED_CROPS:
            if crop in lower:
                return crop.title()
        return None

    def filter_prices(
        self,
        commodity: str | None = None,
        state: str | None = None,
        market: str | None = None,
        query: str | None = None,
    ) -> pd.DataFrame:
        df = self.prices
        if commodity:
            df = df[df["commodity"].str.lower() == commodity.lower()]
        if state:
            df = df[df["state"].str.lower() == state.lower()]
        if market:
            df = df[df["market"].str.lower() == market.lower()]
        if query:
            q = query.lower()
            df = df[df["market_key"].str.lower().str.contains(q) | df["district"].str.lower().str.contains(q)]
        return df.copy()

    def latest_market_snapshot(self, commodity: str, top_n: int = 12) -> pd.DataFrame:
        df = self.filter_prices(commodity=commodity)
        if df.empty:
            return df
        latest = (
            df.sort_values("price_date")
            .groupby(["market", "state", "district"], as_index=False)
            .tail(1)
            .sort_values("modal_price", ascending=False)
            .head(top_n)
        )
        return latest

    def market_series(self, commodity: str, market: str, state: str) -> pd.DataFrame:
        df = self.filter_prices(commodity=commodity, market=market, state=state)
        return df.sort_values("price_date")[["price_date", "modal_price"]]

    def weather_recent(self, city: str, days: int = 14) -> pd.DataFrame:
        df = self.weather[self.weather["city"].str.lower() == city.lower()].sort_values("date")
        return df.tail(days)

    def data_quality_score(self) -> float:
        if not self._quality:
            return 0.0
        price_score = float(self._quality.get("prices_valid_pct", 0))
        weather_score = float(self._quality.get("weather_valid_pct", 0))
        drop_penalty = min(float(self._quality.get("prices_dropped_pct", 0)), 10)
        return round(min(99.0, (price_score * 0.65 + weather_score * 0.25 + (10 - drop_penalty)) / 1.0), 1)


@lru_cache(maxsize=1)
def get_store() -> DataStore:
    store = DataStore()
    store.load()
    return store
