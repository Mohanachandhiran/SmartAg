# 🌾 SmartAg Collective

SmartAg Collective is a production-ready, mobile-first, multilingual SaaS platform built for small and marginal farmers, Farmer Producer Organizations (FPOs), wholesale crop buyers, and state agricultural ministries in India.

The platform uses AI (via the Google Gemini API and custom clustering/scoring algorithms) to maximize farmer income through cooperative logistics, direct buyer bids, market price forecasts, and policy insights.

---

## 🚀 Quick Start (Docker Compose)

The entire multi-tier stack can be launched out-of-the-box using Docker Compose.

1. **Configure Environment Variables**:
   Open the `.env` file at the root and insert your Google Gemini API Key:
   ```env
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
   ```

2. **Orchestrate Stack**:
   Start PostgreSQL, Redis, Python AI Services, Node.js API, and Next.js Frontend in one command:
   ```bash
   docker-compose up --build
   ```

3. **Database Migration & Seeding**:
   Once the containers are running, run database migrations and seed realistic Tamil Nadu datasets:
   ```bash
   # Run in the root directory
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. **Access Portals**:
   - Next.js Web Portal: [http://localhost:3000](http://localhost:3000)
   - Express API Server: [http://localhost:5000](http://localhost:5000)
   - FastAPI AI Services: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔑 Demo Login Credentials

For verification and testing, utilize these seeded phone numbers with mock OTP **`123456`**:

| Role | Demo Phone Number | Local Representative Name |
| :--- | :--- | :--- |
| **👨‍🌾 Farmer** | `9876543210` | Anbu Selvan |
| **🏢 FPO Coordinator** | `9000000001` | Madurai Farmers Collective |
| **🛒 Wholesale Buyer** | `8000000001` | Rel-Agro Foods Ltd |
| **🏛️ State Government** | `7000000001` | State Agriculture Director |

---

## 🛠️ Local Development (Without Docker)

To run the services locally in separate shell terminals:

### 1. Database & Prisma Seeding
1. Start local PostgreSQL and Redis servers.
2. In the root directory:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

### 2. Express Backend API
1. Navigate to backend:
   ```bash
   cd apps/api
   npm install
   npm run dev
   ```

### 3. Next.js Web Frontend
1. Navigate to web client:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

### 4. Python FastAPI AI Services
1. Navigate to AI services directory:
   ```bash
   cd services/ai
   ```
2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies and start server:
   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

---

## 📁 File Structure

```
smartag-collective/
├── apps/
│   ├── web/                    # Next.js 15 Web Portal
│   │   ├── app/                # App Router Layouts & Pages
│   │   ├── components/         # Shared Header, Leaflet Maps, charts
│   │   └── messages/           # Tamil, English, Hindi Translation JSONs
│   └── api/                    # Express.js API Server
│       └── src/                # Authentication, Farmer, FPO, Buyer, Government Routers
├── services/
│   └── ai/                     # Python FastAPI AI Microservices
│       ├── main.py             # FastAPI entry
│       ├── price_forecast.py   # pricing trends
│       ├── risk_engine.py      # weather + crop volatility
│       └── voice_chat.py       # Gemini API Voice Assist
├── prisma/
│   ├── schema.prisma           # Prisma relational models
│   └── seed.ts                 # Database Tamil Nadu seeder script
├── docker-compose.yml          # Container orchestration
└── .env                        # Environment configurations
```
