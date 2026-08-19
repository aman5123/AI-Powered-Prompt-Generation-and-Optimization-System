# AI-Powered Prompt Generation & Optimization System

<div align="center">

![PromptOptimizer](https://img.shields.io/badge/PromptOptimizer-AI%20Powered-blue?style=for-the-badge&logo=openai)
![Node.js](https://img.shields.io/badge/Node.js-24.x-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A full-stack AI application that analyzes, optimizes, and compares prompts across 5 free AI providers with automatic fallback.**

[Live Demo](https://ai-powered-prompt-generation-and-optimiza.vercel.app) · [Report Bug](https://github.com/aman5123/AI-Powered-Prompt-Generation-and-Optimization-System/issues)

</div>

---

## ✨ Features

- 🔍 **Prompt Analysis** — Analyzes objective, tone, audience, weaknesses, and missing information
- ⚡ **Prompt Optimization** — Generates a significantly improved prompt while preserving original intent
- 📊 **Side-by-Side Comparison** — Runs both prompts through AI and compares responses with scores
- 🤖 **Multi-Provider AI** — Supports 5 providers (Gemini, OpenRouter, Groq, Mistral, Cohere) with automatic failover
- 🔄 **Auto-Fallback** — If one provider hits a rate limit, automatically tries the next one in 60s cooldown
- 🎛️ **User-Controlled Models** — Switch providers and models at runtime via the in-app settings panel
- 📈 **Score System** — Prompt scores (0–100) with improvement tracking
- 🕑 **History Tracking** — All optimization runs saved to MongoDB with provider attribution
- 📋 **Copy Buttons** — One-click copy on every prompt and response block
- 🌙 **Modern UI** — Glassmorphism dark design, fully responsive

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v4, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose) |
| **AI Providers** | Google Gemini, OpenRouter, Groq, Mistral AI, Cohere |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 🤖 Supported AI Providers

| Provider | Free Tier | Models Available |
|---|---|---|
| **Google Gemini** | 1,500 req/day | gemini-1.5-flash, gemini-1.5-pro |
| **OpenRouter** | 20 RPM, 300+ models | Gemma 2, Qwen 2, DeepSeek R1, Phi-3 |
| **Groq** | 1,000 req/day, ultra-fast | LLaMA 3.3 70B, Mixtral 8x7B, Gemma 2 |
| **Mistral AI** | Experiment plan | Mistral Small, Open Mixtral 8x7B |
| **Cohere** | 1,000 calls/month | Command R, Command R+, Command Light |

> You only need **one** API key to get started. Add more for fallback redundancy.

---

## 🚀 Local Development

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- At least one free API key (see providers table above)

### 1. Clone & Install

```bash
git clone https://github.com/aman5123/AI-Powered-Prompt-Generation-and-Optimization-System.git
cd AI-Powered-Prompt-Generation-and-Optimization-System

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5001
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net

# Provider order — left = highest priority. Remove any you don't have keys for.
PROVIDER_ORDER=gemini,openrouter,groq,mistral,cohere
PROVIDER_COOLDOWN_MS=60000

# Add at least ONE of these keys:
GEMINI_API_KEY=your_key_here        # https://aistudio.google.com/
GEMINI_MODEL=gemini-1.5-flash

OPENROUTER_API_KEY=your_key_here    # https://openrouter.ai/
OPENROUTER_MODEL=google/gemma-2-9b-it:free

GROQ_API_KEY=your_key_here          # https://console.groq.com/
GROQ_MODEL=llama-3.3-70b-versatile

MISTRAL_API_KEY=your_key_here       # https://console.mistral.ai/
MISTRAL_MODEL=mistral-small-latest

COHERE_API_KEY=your_key_here        # https://dashboard.cohere.com/
COHERE_MODEL=command-r
```

### 3. Start Servers

```bash
# Terminal 1 — Backend
cd server
node server.js

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## ☁️ Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo, set **Root Directory** to `server`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add **Environment Variables** in the Render dashboard (all keys from your `.env`)
6. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel

1. Import the repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Vercel auto-detects Vite — no extra config needed
4. The included `vercel.json` automatically proxies `/api/*` calls to your Render backend

> **Important:** Update `client/vercel.json` with your actual Render URL before deploying:
> ```json
> {
>   "rewrites": [{
>     "source": "/api/:path*",
>     "destination": "https://YOUR-APP.onrender.com/api/:path*"
>   }]
> }
> ```

---

## 🔧 How the Multi-Provider Fallback Works

```
User submits a prompt
  │
  ▼
ProviderManager tries providers in PROVIDER_ORDER
  ├─ Gemini ──── OK? → return result ✅
  │               └─ 429/401/404? → mark exhausted (60s cooldown) → try next
  ├─ OpenRouter ─ OK? → return result ✅
  │               └─ error? → mark exhausted → try next
  ├─ Groq ─────── OK? → return result ✅
  │               └─ error? → mark exhausted → try next
  ├─ Mistral ──── OK? → return result ✅
  └─ Cohere ───── OK? → return result ✅
                  └─ all exhausted? → return error with details
```

After 60 seconds, exhausted providers automatically reset and are tried again.

---

## 📁 Project Structure

```
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Provider health indicator
│   │   │   ├── ProviderSelector.jsx # Settings panel
│   │   │   ├── PromptInput.jsx    # Input with provider chip
│   │   │   └── ResultsView.jsx    # Score rings, comparison, copy buttons
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── History.jsx        # With provider attribution
│   │   └── services/api.js
│   └── vercel.json               # API proxy rewrites for production
│
└── server/                   # Express backend
    ├── routes/api.js              # REST endpoints
    ├── services/
    │   ├── providerManager.js     # Fallback engine
    │   ├── geminiService.js       # Prompt processing logic
    │   └── providers/             # Per-provider adapters
    │       ├── geminiProvider.js
    │       ├── openrouterProvider.js
    │       ├── groqProvider.js
    │       ├── mistralProvider.js
    │       └── cohereProvider.js
    └── server.js                  # Express app + CORS
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/prompts/process` | Process & optimize a prompt |
| `GET` | `/api/history` | Get all history |
| `DELETE` | `/api/history/:id` | Delete a history item |
| `GET` | `/api/providers/status` | Real-time provider health |
| `GET` | `/api/providers/models` | Available models per provider |
| `GET` | `/api/test-gemini` | Test active provider connection |
| `GET` | `/health` | Server health check |

**POST `/api/prompts/process` body:**
```json
{
  "prompt": "your prompt here",
  "provider": "groq",        // optional — override auto-fallback
  "model": "gemma2-9b-it"   // optional — override default model
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/aman5123">aman5123</a>
</div>
