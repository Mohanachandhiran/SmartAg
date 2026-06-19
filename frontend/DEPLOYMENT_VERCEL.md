# SmartAg Frontend Deployment Guide (Vercel)

This guide provides a detailed, step-by-step procedure to deploy the Next.js frontend of the **SmartAg** project on [Vercel](https://vercel.com/) and generate a secure `NEXTAUTH_SECRET`.

---

## 🔑 How to Generate a Secure NEXTAUTH_SECRET

NextAuth requires a secure, random signing key to encrypt JWT tokens and sessions. You can generate a cryptographically secure 32-character string using your terminal.

Choose **one** of the methods below:

### Method A: Using Node.js (Recommended for all platforms)
Since Node.js is installed on your computer, run this command in your terminal (PowerShell, Command Prompt, or terminal emulator):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Method B: Using PowerShell (Windows Native)
If you are using Windows PowerShell, you can run:
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Method C: Using Git Bash / Linux / macOS
If you have Git Bash, WSL, or Linux/macOS, run:
```bash
openssl rand -base64 32
```

*Copy the output of any of these commands. It will look like a random set of characters (e.g., `d2Vyc2RmYXNkZmFzZGZhc2RmYXNkZmFzZGY=`). This is your `NEXTAUTH_SECRET`.*

---

## 🚀 Step-by-Step Vercel Deployment

Vercel seamlessly integrates with Next.js monorepos and subdirectories.

### Step 1: Create a Vercel Account
1. Go to [Vercel](https://vercel.com/) and sign up / log in (using your GitHub account is recommended).

### Step 2: Import Your Repository
1. In the Vercel Dashboard, click **Add New** -> **Project**.
2. Select your repository: `Mohanachandhiran/SmartAg` and click **Import**.

### Step 3: Configure Project Settings
Since the Next.js project is located in the `frontend` folder, you must tell Vercel to look inside that folder:

1. **Root Directory**: Click **Edit** next to the Root Directory setting and select the **`frontend`** directory.
2. **Framework Preset**: Vercel will automatically detect **Next.js**.
3. **Build & Development Settings**: Leave these as defaults.

### Step 4: Configure Environment Variables
Expand the **Environment Variables** section and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://smartag-api.onrender.com/api` | The URL of your Express backend API (deployed on Render). |
| `NEXTAUTH_SECRET` | *[Paste the secret you generated above]* | Your cryptographically secure random string. |
| `NEXTAUTH_URL` | `https://your-project-name.vercel.app` | The production URL of your frontend. *(Vercel will generate this preview link when importing, or you can update it after deployment)* |
| `OPENWEATHER_API_KEY` | `a003033829d57cf4ba741daff83dcbb6` | Your OpenWeather API key. |

### Step 5: Deploy
1. Click **Deploy**.
2. Vercel will build the Next.js application, optimize static files, and deploy it to a global edge network.
3. Once completed, Vercel will provide you with a production URL (e.g., `https://smartag-web.vercel.app`).

---

## 🔄 Step 6: Post-Deployment Sync (Final Step)

After Vercel gives you your frontend URL:
1. Update your **Express backend** settings on Render. In Render, go to your `smartag-api` service settings and make sure the CORS settings permit your new Vercel URL.
2. Update the `NEXTAUTH_URL` environment variable on Vercel to match your final production domain.
