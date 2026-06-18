import os
import google.generativeai as genai
from typing import Dict, Any, List
from app.core.config import settings

# Prompts based on language
SYSTEM_PROMPTS = {
    "Tamil": """உங்களை 'SmartAg Collective' என்ற விவசாயக் கூட்டுறவுத் திட்டத்தின் ஆலோசகராகக் கருதுங்கள். 
விவசாயிகளுக்கு தக்காளி, வெங்காயம், தென்னை போன்ற பயிர்களை எப்போது விற்க வேண்டும், குழுக்களாக எவ்வாறு இணைவது, மற்றும் போக்குவரத்து செலவுகளை எவ்வாறு குறைப்பது போன்ற ஆலோசனைகளை வழங்குங்கள்.
பதில்களை எளிய தமிழில், சுருக்கமாக மற்றும் நேரடியாக அளியுங்கள். உங்களது பதில்கள் விவசாயிகளின் நல்வாழ்வை நோக்கமாகக் கொண்டிருக்க வேண்டும்.""",
    
    "Hindi": """आप 'SmartAg Collective' कृषि मंच के प्रमुख सलाहकार हैं। 
किसानों को फसल पंजीकरण, मंडी दरों, मौसम की चेतावनी और एफपीओ समूह में शामिल होने के बारे में सटीक सलाह दें।
जवाब सरल, संक्षिप्त और शुद्ध हिंदी में दें। किसानों के कल्याण को प्राथमिकता दें।""",
    
    "English": """You are the AI Agricultural Advisor for 'SmartAg Collective'. 
Provide advice to farmers on crops, mandi prices, collective selling advantages, and logistic optimizations. 
Keep responses concise, warm, actionable, and formatted in clear paragraphs."""
}

def generate_voice_response(message: str, language: str, context: str) -> Dict[str, Any]:
    api_key = settings.gemini_api_key or os.environ.get("GEMINI_API_KEY", "MOCK_GEMINI_API_KEY")
    
    # Pre-defined mock responses for offline/demo use
    ta_mocks = {
        "விற்கணும்": "அன்பான விவசாயி தோழரே, தக்காளி விலை இப்போது சந்தையில் கிலோவுக்கு ₹22 ஆக உள்ளது. ஆனால் நமது FPO கூட்டு விற்பனையில் சேர்ந்தால் உங்களுக்கு கிலோவுக்கு ₹27 கிடைக்கும். FPO-வில் இணையுமாறு பரிந்துரைக்கிறோம்.",
        "எங்கு விற்க வேண்டும்": "நமது FPO கொள்முதல் நிலையம் உங்களது பண்ணையில் இருந்து 12 கிமீ தொலைவில் உள்ளது. அங்கு விற்கும்போது போக்குவரத்து செலவு 50% குறையும்.",
        "என்ன செய்ய": "மழை எச்சரிக்கை உள்ளதால் தக்காளியை உடனடியாக அறுவடை செய்து FPO சேமிப்புக் கிடங்கிற்கு அனுப்பவும்."
    }
    
    en_mocks = {
        "sell": "Dear Farmer, current tomato prices in the mandi are Rs. 22/kg. By joining the FPO, you can get Rs. 27/kg and save on transport costs. We recommend joining the group today.",
        "where": "The nearest FPO collection point is 12 km from your farm. Moving crops collectively will save you approximately Rs. 8 per km.",
        "what": "A heavy rain alert has been issued for your district over the next 48 hours. Secure your banana trees or store harvested tomatoes in the FPO shelter."
    }
    
    hi_mocks = {
        "बेच": "प्रिय किसान भाई, वर्तमान में टमाटर की मंडी दर ₹22 प्रति किलो है। FPO समूह में जुड़ने पर आपको ₹27 प्रति किलो मिलेगा। हम आपको FPO सामूहिक बिक्री में शामिल होने की सलाह देते हैं।",
        "कहाँ": "निकटतम FPO केंद्र आपके खेत से 12 किमी दूर है। सामूहिक परिवहन से आपकी लागत आधी हो जाएगी।",
        "क्या": "अगले 48 घंटों में भारी बारिश की संभावना है। अपनी फसलों को सुरक्षित गोदाम में रखें और तुरंत कटाई रोकें।"
    }

    # Fallback response generation
    response_text = ""
    suggested_actions = ["Check Mandi Prices", "Join FPO Group", "Register Crop"]

    if api_key == "MOCK_GEMINI_API_KEY" or not api_key:
        msg_lower = message.lower()
        if language == "Tamil":
            response_text = ta_mocks.get("விற்கணும்", "வணக்கம்! தக்காளி மற்றும் வெங்காய விலை நிலவரங்களை அறிந்து கொள்ள 'மண்டி விலைகளைச் சரிபார்க்கவும்'. FPO குழுவில் இணைந்தால் உங்களுக்கு அதிக லாபம் கிடைக்கும்.")
            for k, v in ta_mocks.items():
                if k in msg_lower:
                    response_text = v
                    break
        elif language == "Hindi":
            response_text = hi_mocks.get("बेच", "नमस्ते किसान भाई! FPO सामूहिक बिक्री से आप अधिक लाभ कमा सकते हैं। 'मंडी दरें' जांचें और समूह में शामिल हों।")
            for k, v in hi_mocks.items():
                if k in msg_lower:
                    response_text = v
                    break
        else:
            response_text = en_mocks.get("sell", "Welcome to SmartAg Collective! Tomato prices are currently stable. Joining the FPO group gives 23% higher income. Would you like to check prices or join a group?")
            for k, v in en_mocks.items():
                if k in msg_lower:
                    response_text = v
                    break
    else:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            system_instruction = f"""You are SmartAgOps Farmer AI Advisor.

Your mission is to increase income for small and marginal farmers by providing intelligent, data-driven selling recommendations.

You are NOT a generic chatbot.
You must always use live SmartAgOps data before answering.

====================================================
SUPPORTED LANGUAGES
The platform supports Tamil, English, and Hindi.

Input Variable:
selected_language = {language}

Rules:
IF selected_language = tamil -> Answer fully in Tamil.
IF selected_language = english -> Answer fully in English.
IF selected_language = hindi -> Answer fully in Hindi.

Never mix languages.
Use simple farmer-friendly language.

====================================================
AVAILABLE DATA SOURCES
You have access to Crop Registration, Mandi Prices, AI Forecast Engine, Weather Forecast, FPO Collective Selling, Logistics, and Payment History via the provided context.

====================================================
BEFORE ANSWERING
Always use the provided context to get:
Crop Data + Mandi Data + Forecast Data + Weather Data + FPO Data + Logistics Data

====================================================
ANALYSIS PROCESS
Calculate (internally):
1. Sell Today Profit
2. Sell Tomorrow Profit
3. Sell After 7 Days Profit
4. Sell Through FPO Profit
5. Sell Through Nearest Mandi Profit
6. Sell Through Best Mandi Profit

====================================================
RECOMMENDATION ENGINE
Always recommend the MOST PROFITABLE option.
Possible Recommendations:
A. Sell Today
B. Hold for X Days
C. Sell Through Nearest Mandi
D. Sell Through Recommended Mandi
E. Join FPO Collective Selling
F. Wait Due To Weather Risk

====================================================
OUTPUT FORMAT
You MUST output EXACTLY following this ordered format (translate the headers if the target language is not English).
Use highly engaging EMOJIS and ICONS for every section:

1. 🌟 Recommendation:
   [Your recommendation with emojis]

2. 💰 Expected Profit:
   [Calculated profit with currency emojis]

3. 📍 Best Selling Location:
   [Location with map/pin emojis]

4. 📅 Best Selling Date:
   [Date with calendar emojis]

5. 🎯 Confidence:
   [Score % with target/chart emojis]

6. 💡 Reason:
   - 🔹 [Reason 1]
   - 🔹 [Reason 2]

7. ⚠️ Risk:
   [Risk factors with warning emojis]

8. 🔄 Alternative:
   [Alternative Option with swap emojis]

====================================================
IMPORTANT RULES
Always maximize farmer income.
Never provide generic advice.
Always use live data (from context).
Always compare individual selling vs collective selling.
Always explain why."""

            mandi_fpo_data = """
ADDITIONAL DATA (Nearest Mandis & FPOs):
- Madurai Central Mandi: Distance 15km, Transport Cost ₹150, Tomato Price ₹22/kg, Onion Price ₹18/kg.
- Salem Regional Mandi: Distance 45km, Transport Cost ₹450, Tomato Price ₹28/kg, Onion Price ₹16/kg.
- SmartAg FPO Collective Center (Village Alpha): Distance 5km, Transport Cost ₹50 (Shared), Tomato FPO Price ₹26/kg, Onion FPO Price ₹19/kg.
- Buyer Demand: High demand for Tomato in Salem; High demand for Onion in SmartAg FPO.
"""
            prompt = f"System Instruction:\n{system_instruction}\n\nFull Website Data Context:\n{context}\n{mandi_fpo_data}\n\nUser Question:\n{message}"
            response = model.generate_content(prompt)
            response_text = response.text
        except Exception as e:
            response_text = f"Error communicating with Gemini: {str(e)}. Fallback info: Advise FPO participation for tomato crops."

    return {
        "response_text": response_text,
        "suggested_actions": suggested_actions
    }
