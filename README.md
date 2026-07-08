<p align="center">
  <img src="public/images/hero-trophy.png" alt="World Cup Hub trophy" width="120" />
</p>

<h1 align="center">World Cup Hub · Mundial Now</h1>

<p align="center">
  <strong>StreamNet 2.0</strong> — premium sports streaming for FIFA World Cup 2026<br/>
  <em>מונדיאל עכשיו · חוויית סטרימינג בעברית (RTL)</em>
</p>

<p align="center">
  <a href="https://mundial-now.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-mundial--now.vercel.app-00A86B?style=for-the-badge" alt="Live demo" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel" /></a>
  <a href="https://github.com/liad07/WC26-HUB"><img src="https://img.shields.io/badge/GitHub-WC26--HUB-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
</p>

<p align="center">
  <a href="https://mundial-now.vercel.app">🌐 Production</a> ·
  <a href="https://mundial-now.vercel.app/about">📖 About (in app)</a> ·
  <a href="https://github.com/liad07/WC26-HUB">⭐ Source</a>
</p>

---

<p align="center">
  <img src="public/images/hero-stadium.png" alt="Stadium hero" width="100%" />
</p>

## ✨ What is this?

**World Cup Hub** is the current flagship experience from **[Crack Apps](https://github.com/liad07)** (est. 2019) — a personal software studio for apps, games, and tutorials. It carries forward the spirit of **StreamNet**, a graduation-project live streaming platform (*“Streaming Everything You Need”*). Think of World Cup Hub as **StreamNet 2.0**: focused, polished, and built for the biggest tournament on earth.

Built with ❤️ by **Crack Apps** · Powered by **StreamNet**

## 🎯 Features

| Area | Highlights |
|------|------------|
| **Home & live** | Live scores, match cards, and a real-time feel for what is on right now |
| **Schedule** | Timeline-style schedule so you never miss a kickoff |
| **Tournament** | Tabs and views across the World Cup journey |
| **Match center** | Per-match detail pages with stats and context |
| **Standings** | Group tables and progression at a glance |
| **Bracket** | Knockout visualization for the road to the final |
| **Watch** | Gated HLS stream experience for match viewing |
| **Fan chat** | Match-room chat — local fallback or online (Clerk + Neon + Pusher) |
| **Auth** | Sign in / sign up via Clerk when online mode is configured |
| **About** | In-app story: Crack Apps, StreamNet legacy, and this project |

Data layers combine **FIFA-facing feeds**, **API-Football**, TV/XMLTV-style guides, and sensible fallbacks when keys are not set — so the UI always stays usable in dev.

## 🛠 Tech stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router) + **React 19** + **TypeScript**
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Video:** [hls.js](https://github.com/video-dev/hls.js) for adaptive streaming
- **Data:** FIFA API patterns, API-Football / API-Sports, mock fallbacks
- **Auth:** [Clerk](https://clerk.com) (optional, for online chat & accounts)
- **Database:** [Neon](https://neon.tech) Postgres (optional, chat persistence)
- **Realtime:** [Pusher Channels](https://pusher.com) (optional, live chat)

## 🧭 Part of the Crack Apps ecosystem

| Project | Role |
|---------|------|
| **Crack Apps** | Studio hub — apps, experiments, and learning projects since 2019 |
| **StreamNet** | Original streaming vision — graduation project, spiritual predecessor to this app |
| **World Cup Hub** | Production-focused sports product for WC 2026 — what you are looking at now |

Older Crack Apps / StreamNet repositories may be private or archived; this repo is the public home for the **WC26** experience.

## 🚀 Getting started

```bash
git clone https://github.com/liad07/WC26-HUB.git
cd WC26-HUB
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## 🔐 Environment variables

Copy **`.env.example`** → **`.env`** and fill in only what you need. **Never commit `.env` or real secrets.**

| Variable | Purpose |
|----------|---------|
| `API_FOOTBALL_KEY` | API-Football / API-Sports key (optional — mocks without it) |
| `API_FOOTBALL_HOST` | API host override |
| `DATABASE_URL` | Neon Postgres for online chat |
| `NEXT_PUBLIC_CLERK_*` / `CLERK_SECRET_KEY` | Clerk authentication |
| `PUSHER_*` / `NEXT_PUBLIC_PUSHER_*` | Realtime chat delivery |

Online fan chat activates when **database + Clerk + Pusher** are all configured; otherwise chat stays in a local/offline mode.

## 📸 Assets in this repo

README visuals use:

- `public/images/hero-trophy.png`
- `public/images/hero-stadium.png`

Additional screenshots can be added under `public/images/readme/` over time.

## 📄 License & use

This project is shared as a portfolio / learning artifact. Respect third-party API terms (FIFA, API-Football, broadcast sources) when deploying your own instance.

---

<p align="center">
  <sub>World Cup Hub · <a href="https://mundial-now.vercel.app">mundial-now.vercel.app</a> · Crack Apps × StreamNet</sub>
</p>