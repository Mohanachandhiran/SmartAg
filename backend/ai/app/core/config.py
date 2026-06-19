from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# Resolve ROOT_DIR and DATASETS_DIR robustly across local, Docker, and Render deployments
def _resolve_paths():
    current = Path(__file__).resolve()
    # 1. Try standard development structure (5 levels up)
    try:
        dev_root = current.parents[4]
        if (dev_root / "datasets").exists():
            return dev_root, dev_root / "datasets"
    except IndexError:
        pass

    # 2. Walk up parent directories to find "datasets"
    for parent in current.parents:
        if (parent / "datasets").exists():
            return parent, parent / "datasets"

    # 3. Fallback default
    fallback_root = current.parents[2] # backend/ai
    return fallback_root, fallback_root / "datasets"

ROOT_DIR, DATASETS_DIR = _resolve_paths()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ROOT_DIR / ".env"), extra="ignore")

    app_name: str = "SmartAg Ops Intelligence API"
    api_prefix: str = "/api"
    datasets_dir: Path = DATASETS_DIR
    cache_dir: Path = ROOT_DIR / "services" / "ai" / ".cache"
    default_commodity: str = "Wheat"
    default_state: str = "Kerala"
    forecast_horizon_days: int = 7
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
    ]

    prices_file: str = "agmarknet_india_historical_prices_2024_2025.csv"
    production_file: str = "India Agriculture Crop Production.csv"
    weather_file: str = "india_2000_2024_daily_weather.csv"

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"


settings = Settings()
settings.cache_dir.mkdir(parents=True, exist_ok=True)
