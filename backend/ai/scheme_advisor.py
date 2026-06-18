import os
import json
import re
import csv
import google.generativeai as genai
from app.models.schemas import SchemeProfileRequest, SchemeAnalysisResponse, SchemeRecommendation
from app.core.config import settings

def load_scheme_dataset():
    data_path = os.path.join(os.path.dirname(__file__), "app", "data", "tamil_nadu_farmer_schemes.csv")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Failed to load dataset: {e}")
        return ""

def calculate_benefits(profile: SchemeProfileRequest):
    # Parse land area (extract numbers)
    try:
        acres_match = re.search(r'\d+(\.\d+)?', str(profile.landArea))
        acres = float(acres_match.group(0)) if acres_match else 2.0
    except:
        acres = 2.0

    annual_support = 0
    loan_eligibility = 0
    subsidy_eligibility = 0

    # 1. Annual Support (PM-KISAN)
    if profile.landOwnership.lower() in ["own land", "சொந்த நிலம்", "खुद की जमीन"]:
        annual_support += 6000

    # 2. Loan Eligibility (Kisan Credit Card)
    if str(profile.needLoan).lower() in ["yes", "ஆம்", "हाँ"]:
        calculated_loan = 50000 + (acres * 50000)
        loan_eligibility = min(int(calculated_loan), 300000)

    # 3. Subsidy Eligibility
    if str(profile.needIrrigation).lower() in ["yes", "ஆம்", "हाँ"]:
        subsidy_eligibility += int(acres * 35000) # Drip Irrigation Subsidy estimate
        
    if str(profile.needSolar).lower() in ["yes", "ஆம்", "हाँ"]:
        subsidy_eligibility += 50000 # Solar pump subsidy base estimate
        
    if str(profile.needMachinery).lower() in ["yes", "ஆம்", "हाँ"] or str(profile.needTractor).lower() in ["yes", "ஆம்", "हाँ"]:
        subsidy_eligibility += 40000 # Farm mechanization estimate

    total_benefits = annual_support + loan_eligibility + subsidy_eligibility

    return {
        "annual_support": annual_support,
        "loan_eligibility": loan_eligibility,
        "subsidy_eligibility": subsidy_eligibility,
        "total_benefits": total_benefits
    }

def analyze_schemes(profile: SchemeProfileRequest) -> SchemeAnalysisResponse:
    api_key = settings.gemini_api_key or os.environ.get("GEMINI_API_KEY", "MOCK_GEMINI_API_KEY")
    
    calc = calculate_benefits(profile)
    dataset_csv = load_scheme_dataset()
    
    # Pre-calculated mock responses if no API key is available
    if api_key == "MOCK_GEMINI_API_KEY" or not api_key:
        return SchemeAnalysisResponse(
            schemes=[
                SchemeRecommendation(
                    id="SCH-01",
                    name="PM-KISAN Samman Nidhi",
                    benefitAmount="₹6,000/year",
                    eligibilityScore=100,
                    matchReason="You are a registered farmer with valid land records.",
                    documents=["Aadhaar", "Bank Passbook", "Land Document"],
                    link="https://pmkisan.gov.in"
                )
            ],
            totalBenefitsValue=calc["total_benefits"],
            annualSupportValue=calc["annual_support"],
            loanEligibilityValue=calc["loan_eligibility"],
            subsidyEligibilityValue=calc["subsidy_eligibility"],
            aiExplanation="Based on your profile, we strongly recommend applying for PM-KISAN first for immediate cash support."
        )

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        system_instruction = f"""You are the SmartAg Collective Scheme Advisor AI.
        
Your task is to analyze a farmer's profile, calculate their eligibility against a REAL dataset of Tamil Nadu Government Schemes, and output exact JSON.

====================================================
STRICT LANGUAGE REQUIREMENT
The farmer's selected language is: {profile.language}

IF selected_language is 'ta' or 'Tamil', you MUST translate ALL scheme names, match reasons, document names, and the aiExplanation into Tamil.
IF selected_language is 'hi' or 'Hindi', you MUST translate ALL scheme names, match reasons, document names, and the aiExplanation into Hindi.
IF selected_language is 'en' or 'English', output in English.
Do NOT mix languages.

====================================================
SCHEME DATASET CONTEXT (CSV FORMAT)
Use this exact dataset to find the best matching schemes for the farmer.
You MUST pull the true 'application_link' and 'documents' directly from this dataset.

{dataset_csv}

====================================================
PRE-CALCULATED FINANCIALS
Total Benefits: ₹{calc['total_benefits']}
Annual Support: ₹{calc['annual_support']}
Loan Eligibility: ₹{calc['loan_eligibility']}
Subsidy Eligibility: ₹{calc['subsidy_eligibility']}

====================================================
OUTPUT FORMAT
Output ONLY a raw JSON object matching this schema exactly (No markdown formatting, no backticks, no explanations outside JSON):
{{
    "schemes": [
        {{
            "id": "SCH-01",
            "name": "Scheme Name from Dataset",
            "benefitAmount": "Value in ₹ based on Dataset",
            "eligibilityScore": 95,
            "matchReason": "Why they qualify based on land/crop",
            "documents": ["Doc 1 from dataset", "Doc 2 from dataset"],
            "link": "Application link directly from dataset"
        }}
    ],
    "totalBenefitsValue": {calc['total_benefits']},
    "annualSupportValue": {calc['annual_support']},
    "loanEligibilityValue": {calc['loan_eligibility']},
    "subsidyEligibilityValue": {calc['subsidy_eligibility']},
    "aiExplanation": "A detailed 3-paragraph explanation of priority, reasoning, and next steps for the recommended schemes."
}}

RULES FOR SCHEME SELECTION:
1. Provide exactly 3 to 5 highly relevant schemes based on their needs (Loan, Irrigation, Machinery, Crops).
2. PM-KISAN should almost always be included if they own land.
3. KCC should be included if they need a loan.
"""
        
        user_prompt = f"""
Farmer Profile:
Name: {profile.name}
State: {profile.state}
District: {profile.district}
Village: {profile.village}
Land Ownership: {profile.landOwnership}
Land Area: {profile.landArea}
Category: {profile.farmerCategory}
Primary Crop: {profile.primaryCrop}
Secondary Crop: {profile.secondaryCrop}
Irrigation: {profile.irrigationType}
Annual Income: {profile.annualIncome}

Needs:
Tractor: {profile.needTractor}
Machinery: {profile.needMachinery}
Irrigation Support: {profile.needIrrigation}
Solar: {profile.needSolar}
Loan: {profile.needLoan}
Insurance: {profile.needInsurance}

Analyze against the provided dataset and output the exact JSON.
"""
        
        response = model.generate_content(
            system_instruction + user_prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        text = response.text
        
        # Clean the response text to extract just the JSON
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
            
        data = json.loads(text)
        
        schemes = []
        for s in data.get("schemes", []):
            schemes.append(SchemeRecommendation(
                id=s.get("id", "SCH-00"),
                name=s.get("name", ""),
                benefitAmount=s.get("benefitAmount", ""),
                eligibilityScore=s.get("eligibilityScore", 0),
                matchReason=s.get("matchReason", ""),
                documents=s.get("documents", []),
                link=s.get("link", "")
            ))
            
        return SchemeAnalysisResponse(
            schemes=schemes,
            totalBenefitsValue=calc['total_benefits'],
            annualSupportValue=calc['annual_support'],
            loanEligibilityValue=calc['loan_eligibility'],
            subsidyEligibilityValue=calc['subsidy_eligibility'],
            aiExplanation=data.get("aiExplanation", "")
        )
        
    except Exception as e:
        print(f"Error in scheme advisor: {e}")
        # Return fallback with pre-calculated numbers
        return SchemeAnalysisResponse(
            schemes=[],
            totalBenefitsValue=calc['total_benefits'],
            annualSupportValue=calc['annual_support'],
            loanEligibilityValue=calc['loan_eligibility'],
            subsidyEligibilityValue=calc['subsidy_eligibility'],
            aiExplanation=f"Error analyzing schemes. Please try again later. Error: {str(e)}"
        )
