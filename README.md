# AI-Powered Prompt Generation and Optimization System

A full-stack web application that analyzes, optimizes, evaluates, and compares AI prompts using the Google Gemini API.

## Features

- **Prompt Analysis**: Analyzes objective, tone, audience, and weaknesses of a prompt.
- **Prompt Optimization**: Generates a better prompt while preserving the gitoriginal intent.
- **Side-by-Side Comparison**: Executes both original and optimized prompts and compares their outputs.
- **AI Evaluation**: Scores prompts and responses across multiple dimensions.
- **History Tracking**: Saves all previous optimization runs to MongoDB for later review.
- **Modern UI**: Glassmorphism design, dark mode, responsive layout.

## Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **AI**: Google Gemini API (`@google/genai`)

## Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

## Setup & Local Development

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (copy from `.env.example`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/prompt-optimizer
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-pro
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup

Open a new terminal.
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Deployment

### Frontend (Vercel)
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set the Root Directory to `client`.
4. Add Environment Variables (if needed, though API_URL is currently hardcoded in `api.js` - you should update it for production).
5. Deploy.

### Backend (Render/Railway)
1. Import the repository.
2. Set Root Directory to `server`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add Environment Variables: `MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL`.
6. Deploy.

### Database
- Use MongoDB Atlas to host your database. Update `MONGODB_URI` in your backend environment variables.

## Known Limitations & Future Improvements
- No user authentication system yet (Single-tenant).
- Gemini API limits: If using a free tier, 429 Too Many Requests may occur. The backend combines 3 steps into 1 prompt to heavily reduce API usage, but concurrent requests are still limited.
