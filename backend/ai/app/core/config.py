from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[4]
DATASETS_DIR = ROOT_DIR / "datasets"


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
