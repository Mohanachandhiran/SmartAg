from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Import AI modules
from price_forecast import forecast_price
from selling_recommendation import get_selling_recommendation, get_mandi_prices
from farmer_grouping import group_farmers
from buyer_recommendation import rank_buyers
from risk_engine import assess_risk
from voice_chat import generate_voice_response
from disease_detect import detect_disease
from scheme_advisor import analyze_schemes
from app.models.schemas import SchemeProfileRequest

# Lifespan for initializing data store
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Data Store and loading CSV datasets...")
    try:
        from app.data.store import get_store
        get_store().load()
        print("Data Store initialized successfully.")
    except Exception as e:
        print(f"Error loading Data Store on startup: {e}")
    yield

app = FastAPI(title="SmartAg AI Microservices API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and mount the datasets-driven API routers from the reference project
try:
    from app.api.routes import router as insight_router
    app.include_router(insight_router, prefix="/api")
    print("Mounted insight routers from app.api.routes under /api")
except Exception as e:
    print(f"Failed to mount insight routers: {e}")

# Models
class PriceForecastRequest(BaseModel):
    crop: str
    district: str
    date_range: Optional[int] = 7

class SellingRecommendationRequest(BaseModel):
    farmId: str
    crop: str
    quantity: float
    location: Dict[str, float]

class FarmerGroupingRequest(BaseModel):
    farms: List[Dict[str, Any]]

class BuyerRecommendationRequest(BaseModel):
    lotId: str
    buyers: List[Dict[str, Any]]

class RiskEngineRequest(BaseModel):
    crop: str
    district: str
    harvestDate: str

class VoiceChatRequest(BaseModel):
    message: str
    language: str
    context: str

# Endpoints
@app.post("/ai/price-forecast")
def api_price_forecast(req: PriceForecastRequest):
    try:
        return forecast_price(req.crop, req.district, req.date_range)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/selling-recommendation")
def api_selling_recommendation(req: SellingRecommendationRequest):
    try:
        return get_selling_recommendation(req.farmId, req.crop, req.quantity, req.location)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/farmer-grouping")
def api_farmer_grouping(req: FarmerGroupingRequest):
    try:
        return group_farmers(req.farms)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/buyer-recommendation")
def api_buyer_recommendation(req: BuyerRecommendationRequest):
    try:
        return rank_buyers(req.lotId, req.buyers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/risk-engine")
def api_risk_engine(req: RiskEngineRequest):
    try:
        return assess_risk(req.crop, req.district, req.harvestDate)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/voice-chat")
def api_voice_chat(req: VoiceChatRequest):
    try:
        return generate_voice_response(req.message, req.language, req.context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/disease-detect")
async def api_disease_detect(file: UploadFile = File(...), language: str = Form("English")):
    try:
        image_bytes = await file.read()
        return detect_disease(image_bytes, language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/scheme-advisor")
def api_scheme_advisor(req: SchemeProfileRequest):
    try:
        return analyze_schemes(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/mandi-prices")
def api_mandi_prices():
    try:
        return get_mandi_prices()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}
