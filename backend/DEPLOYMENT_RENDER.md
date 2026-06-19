# SmartAg Backend Deployment Guide (Render)

This guide provides a detailed, step-by-step procedure to deploy the backend services of the **SmartAg** project on [Render](https://render.com/).

The backend consists of two main services:
1. **SmartAg Node.js Express API** (handles main server operations and database actions via Prisma).
2. **SmartAg Python FastAPI AI Microservice** (handles price forecasting, farmer grouping, disease detection, etc.).

---

## 📋 Prerequisites
Before you start, make sure you have:
1. A **Render account** (free tier is sufficient, though upgrading gives better performance).
2. The latest codebase pushed to your GitHub repository: `https://github.com/Mohanachandhiran/SmartAg.git`.
3. Your Supabase PostgreSQL database credentials (already configured in `backend/.env`).

---

## 🚀 Step 1: Push Recent Changes to GitHub
Ensure all local restructuring changes (including our robustness fixes for paths and optional TensorFlow support) are pushed to your GitHub repository.

In your terminal, run:
```bash
git add .
git commit -m "chore: optimize backend paths and dependencies for Render deployment"
git push origin main
```

---

## 🛠️ Step 2: Deploy the AI Microservice (Python FastAPI)
Deploy the AI service first so that you can get its URL to configure the Node.js Express API in the next step.

1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your **SmartAg** repository.
4. Configure the Web Service settings:
   - **Name**: `smartag-ai`
   - **Region**: Choose the region closest to you (e.g., `Singapore` or `Oregon`).
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Root Directory**: Leave it **empty** (or set to `.`). *This is critical so the service has access to the `datasets/` folder at the root level.*
   - **Build Command**: 
     ```bash
     pip install -r backend/ai/requirements.txt
     ```
   - **Start Command**: 
     ```bash
     PYTHONPATH=backend/ai uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type**: `Free` (or higher).
5. Click **Advanced** and add the following **Environment Variables**:
   - `GEMINI_API_KEY`: `AIzaSyAW9qtotAk8wzEbKS7XIbub83SE37Lomag` (or your personal key)
   - `PYTHONPATH`: `backend/ai`
6. Click **Create Web Service**.

> [!TIP]
> **Free Tier RAM Limits & TensorFlow:**
> Render's free tier has a 512MB RAM limit. Installing and running `tensorflow` (needed for image-based disease detection) might cause build issues or memory crashes on startup. 
> - **If you face memory crashes:** You can edit `backend/ai/requirements.txt` in your repo, delete/comment out the `tensorflow>=2.13.0` line, and redeploy. The service will run all other AI APIs (pricing, risk, farmer grouping) perfectly, and return a friendly error message if disease detection is called.
> - **Alternatively:** Upgrade the AI service to Render's **Starter instance** (1GB RAM, $7/month) to run the full TensorFlow crop disease model.

---

## 🖥️ Step 3: Deploy the Node.js Express API
Next, deploy the primary Express API server.

1. Go back to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Select the same **SmartAg** repository.
4. Configure the Web Service settings:
   - **Name**: `smartag-api`
   - **Region**: Select the same region as the AI service.
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Root Directory**: `backend` *(This builds the self-contained Express app).*
   - **Build Command**: 
     ```bash
     npm install && npx prisma generate
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```
   - **Instance Type**: `Free` (or higher).
5. Click **Advanced** and add the following **Environment Variables**:
   - `DATABASE_URL`: `postgresql://postgres:19Malini_79@db.horltcqrofwcdtzpwlry.supabase.co:5432/postgres?sslmode=require`
   - `FASTAPI_API_URL`: `https://smartag-ai.onrender.com` *(Replace this with the actual URL of your deployed `smartag-ai` service from Step 2).*
6. Click **Create Web Service**.

---

## 🌐 Step 4: Connecting the Frontend
Once both backend services are deployed and running:

1. Copy the URL of your **Express API** service (e.g., `https://smartag-api-1siv.onrender.com`).
2. When deploying your frontend application (e.g., Next.js on Vercel or Render):
   - Set the environment variable `NEXT_PUBLIC_API_URL` to `https://smartag-api-1siv.onrender.com/api`.
   - Set `NEXTAUTH_SECRET` to your secure signing string.

---

## ⚡ Important Render Notes
- **Cold Starts:** On Render's Free tier, the service automatically goes to sleep after 15 minutes of inactivity. When a user visits the app, the first request will trigger a "spin up" which takes around 50 seconds.
- **Prisma Client:** The build command `npx prisma generate` is essential because it generates the database client files dynamically during Render's build step.
