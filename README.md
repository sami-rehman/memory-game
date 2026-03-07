# 🧠 Memory Game Platform

A research platform for studying the effect of **real-time feedback** on children's visual memory performance. Built for Smart-EdTech research comparing two groups:

| Group | Condition | Experience |
|-------|-----------|------------|
| **A (Control)** | No feedback | Neutral "Next →" after each answer |
| **B (Experimental)** | Feedback | Encouraging, growth-mindset feedback + optional audio (sounds + TTS) after each answer |

---

## ✨ Features

- **4-phase flow**: Student entry → Memorize → Quiz (per-question timer) → Round summary → Survey → Results
- **3 rounds**: Animals (warm up) → Fruits & veggies → Countries (flags), with configurable difficulty
- **Group B extras**: Kid-friendly feedback messages, emotion-regulation prompts after wrong/timeout, round-end self-efficacy lines, optional correct/wrong sounds and TTS
- **Admin dashboard**: Overview charts (accuracy, response speed), student registration (single/bulk), auto group assignment, raw data + CSV export
- **Firebase optional**: Runs in **mock mode** (in-memory) by default; add Firebase config for persistent storage
- **Admin protection**: `/admin` route protected with env-based login

---

## 🛠 Tech Stack

- **React 18** + **TypeScript**
- **React Router 7** (/, /admin)
- **Firebase** (Firestore) — optional
- **Recharts** — dashboard charts
- **Tailwind CSS** — utilities + custom animation delays

---

## 📋 Prerequisites

- **Node.js** 18+ and **npm**
- (Optional) **Firebase** project with Firestore enabled

---

## ⚡ Quick Start

### 1. Clone and install

```bash
git clone https://github.com/sami-rehman/memory-game.git
cd memory-game
npm install
```

### 2. Environment variables

Copy the example env file and edit as needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_ADMIN_USER` | Admin login username | `admin` |
| `REACT_APP_ADMIN_PASSWORD` | Admin login password | Set a secure value |
| `REACT_APP_DISABLE_TIMERS` | Set to `true` to disable memorization and quiz timers (testing) | `false` |

**.env** is gitignored; use **.env.example** as the template and never commit secrets.

### 3. Run locally

```bash
npm start
```

- **Game**: [http://localhost:3000](http://localhost:3000)
- **Admin**: [http://localhost:3000/admin](http://localhost:3000/admin) (login with the credentials from `.env`)

The app runs in **mock mode** until Firebase is configured (see below).

---

## 📁 Project Structure

```
memory-game/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx                 # Main app: game + admin UI, routing
│   ├── index.tsx               # Entry point (BrowserRouter)
│   ├── index.css               # Tailwind + animation utilities
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── config/
│   │   └── gameContent.ts      # Rounds, categories, feedback messages, curiosity/emotion/self-efficacy copy
│   ├── firebase/
│   │   ├── config.ts           # Firebase config (add your keys here)
│   │   └── service.ts          # Firestore CRUD
│   ├── auth/
│   │   └── adminAuth.ts        # Admin login validation (env-based)
│   ├── hooks/
│   │   └── useData.tsx         # Data provider (mock ↔ Firebase)
│   ├── utils/
│   │   ├── index.ts            # Shuffle, CSV export, etc.
│   │   └── feedbackAudio.ts    # Correct/wrong sounds + TTS for kids
│   └── components/
│       ├── shared/
│       │   └── index.tsx       # ImageCard, TimerBar, Btn, P, GlobalStyles
│       └── AdminLogin.tsx      # Admin gate component
├── .env.example                # Env template (no secrets)
├── .gitignore                  # node_modules, build, .env, logs, IDE, OS
├── package.json
└── README.md
```

---

## 🎮 Game Flow

1. **Entry** — Student name, age, grade; optional group override (A / B / Auto). Random group assignment when Auto.
2. **Round intro** — Curiosity hook (e.g. “How many animals can you remember?”).
3. **Memorize** — Grid of images for a set time (configurable per round).
4. **Quiz** — Per-question countdown; multiple choice. Group B gets feedback (text + optional audio) and emotion-regulation after wrong/timeout.
5. **Round summary** — Group B gets a self-efficacy line (high/mid/low performance).
6. **Next round** or **Survey** — Enjoyment, would play again, self-efficacy (1–4).
7. **Results** — Simple completion screen.

---

## 📊 Admin Dashboard

- **Overview** — Charts: Group A vs B (accuracy by round, response speed, status).
- **Students** — Register students (single or bulk), view group assignment and live status.
- **Data** — Raw submissions, per-group stats, **CSV export**.

Access at `/admin`; credentials are from `REACT_APP_ADMIN_USER` and `REACT_APP_ADMIN_PASSWORD`.

---

## 🔥 Firebase (optional)

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore Database**.
3. Add a **Web app** and copy the config object.
4. In `src/firebase/config.ts`, replace the placeholder (or existing) `firebaseConfig` with your values.

---

## 📦 Data Captured

**Per question:** student ID, group, round, question index, correct answer, selected answer, correct flag, timeout flag, response time (ms), images shown, memorization duration, timestamp.

**Survey:** enjoyment, would play again, self-efficacy (1–4).

---

## 🔬 Research Design

- **Independent variable:** Feedback (present vs absent).
- **Dependent variables:** Accuracy, response time, improvement across rounds, survey responses.
- **Group assignment:** Automated block randomization (or manual override per student).
- **Bias controls:** Same content, timer, and UI for both groups; only post-answer experience differs (Group B: feedback + emotion regulation + self-efficacy messaging).

---

## 🧩 Intervention Content (Group B)

- **Curiosity hooks** — Short prompts before each round (e.g. “Which one will stick in your mind?”).
- **Emotion regulation** — Kind, short prompts after wrong or timeout (e.g. “It’s okay! Take a breath. The next one is for you!”).
- **Round-end self-efficacy** — One line per round based on performance tier (high / mid / low).
- **Audio** — Optional correct/wrong tones and TTS for feedback text (unlocked on first user interaction).

Copy is centralized in `src/config/gameContent.ts`.

---

## 🔒 Ethics & Privacy

- Use **anonymous student IDs** (no real names in the app or database).
- Keep a separate, offline mapping (ID → name) if needed for your study.
- No PII in Firestore; same game experience for both groups (no disadvantage to control).

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server (default port 3000) |
| `npm run build` | Production build (output in `build/`) |
| `npm test` | Run tests |

---
