<p align="center">
  <img src="app/icon.png" alt="World Cup Hub" width="128" height="128" />
</p>

<h1 align="center">World Cup Hub</h1>

<p align="center">
  <strong>Powered by StreamNet</strong> · StreamNet 2.0<br/>
  <em>חוויית המונדיאל 2026 — שידורים, תוצאות, טבלאות וצ׳אט אוהדים (RTL)</em>
</p>

<p align="center">
  <a href="https://wchub26.vercel.app"><img src="https://img.shields.io/badge/Live-wchub26.vercel.app-6366f1?style=for-the-badge" alt="Live demo" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-Production-black?style=for-the-badge&logo=vercel" alt="Vercel" /></a>
  <a href="https://github.com/liad07/WC26-HUB"><img src="https://img.shields.io/badge/GitHub-WC26--HUB-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
</p>

<p align="center">
  <a href="https://wchub26.vercel.app">🌐 Production</a> ·
  <a href="https://wchub26.vercel.app/about">📖 About</a> ·
  <a href="https://github.com/liad07/crack-apps.github.io">🧩 Crack Apps</a> ·
  <a href="https://github.com/liad07/StreamNet">📡 StreamNet</a>
</p>

---

<p align="center">
  <img src="public/images/hero-stadium.png" alt="Stadium" width="100%" />
</p>

## What is World Cup Hub?

**World Cup Hub** is a premium Hebrew-first sports streaming experience for **FIFA World Cup 2026**. It is the spiritual successor to **[StreamNet](https://github.com/liad07/StreamNet)** (graduation-project live TV platform) and part of the **[Crack Apps](https://github.com/liad07/crack-apps.github.io)** ecosystem (personal software studio since 2019).

> *Streaming Everything You Need* — evolved into a focused tournament product.

Built with ❤️ by **[Crack Apps](https://github.com/liad07/crack-apps.github.io)** · Powered by **[StreamNet](https://github.com/liad07/StreamNet)**

## Features

| Area | What you get |
|------|----------------|
| **Home** | Cinematic hero, live scores, featured match, World Cup countdown |
| **Schedule** | Timeline view — scroll past & future matches, auto-scroll to next kickoff |
| **Match center** | Events, lineups (formation pitch), stats, YouTube highlights link |
| **Tournament** | Unified **בתים וטבלאות** + **נוקאאוט** tabs with official FIFA bracket tree |
| **Live** | Auto-refreshing scores, goals, cards, substitutions |
| **Watch** | HLS player (custom controls, quality, PiP, iOS native HLS), gated when no Mundial on air |
| **Fan chat** | Online chat (Clerk + Neon + polling) or local fallback |
| **Shabbat Guard** | IP-based zmanim, stream/chat block during Shabbat ([shabbat-guard](https://github.com/liad07/shabbat-guard) logic) |
| **Admin** | Owner dashboard at `/admin` — visits, live viewers, Clerk users, Shabbat stats |
| **PWA** | App icon, manifest, install to home screen (iOS & Android) |
| **Auth** | Clerk sign-in / sign-up with profile & avatar |

Data: **FIFA API** (primary, no key) → API-Football → mock fallbacks. Kan 11 EPG for Mundial-only TV schedule.

## Screenshots

<p align="center">
  <img src="public/images/hero-trophy.png" alt="Trophy" width="280" />
</p>

## Tech stack

- **Next.js 15** · App Router · React 19 · TypeScript
- **Tailwind CSS** — dark premium design system (RTL)
- **hls.js** + native Safari HLS on iOS
- **Clerk** — authentication
- **Neon Postgres** — chat + analytics
- **Hebcal + ipapi.co** — Shabbat times (IP-only, no geolocation prompt)
- **Recharts** — admin analytics charts

## Ecosystem

| Project | Link | Role |
|---------|------|------|
| **Crack Apps** | [github.com/liad07/crack-apps.github.io](https://github.com/liad07/crack-apps.github.io) | Creator studio |
| **StreamNet** | [github.com/liad07/StreamNet](https://github.com/liad07/StreamNet) | Original streaming platform |
| **Shabbat Guard** | [github.com/liad07/shabbat-guard](https://github.com/liad07/shabbat-guard) | Shabbat protection library |
| **World Cup Hub** | [github.com/liad07/WC26-HUB](https://github.com/liad07/WC26-HUB) | This repo · [live](https://wchub26.vercel.app) |

```
Crack Apps → StreamNet → World Cup Hub
```

## Getting started

```bash
git clone https://github.com/liad07/WC26-HUB.git
cd WC26-HUB
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run typecheck` | TypeScript check |
| `npm run icons` | Regenerate PWA icons from source |

## Environment

Copy `.env.example` → `.env`. **Never commit secrets.**

| Variable | Purpose |
|----------|---------|
| `API_FOOTBALL_KEY` | Optional API-Football backup |
| `DATABASE_URL` | Neon — chat + analytics |
| `NEXT_PUBLIC_CLERK_*` / `CLERK_SECRET_KEY` | Clerk auth |
| `NEXT_PUBLIC_SHABBAT_GUARD_ENABLED` | Shabbat guard on/off (default on) |
| `PUSHER_*` | Optional — chat uses DB polling without it |

Online chat activates with **Clerk + DATABASE_URL**. Pusher is optional.

## Project status

This repository is a **completed portfolio / production build** for World Cup 2026. The codebase is stable and deployed; future experiments live under new Crack Apps projects.

## Assets

| File | Use |
|------|-----|
| `app/icon.png` | App & favicon (512×512) |
| `app/apple-icon.png` | iOS home screen |
| `public/icons/` | PWA icons (192, 512, maskable) |
| `public/images/hero-stadium.png` | Marketing hero |
| `public/images/hero-trophy.png` | Bracket / trophy visuals |
| `assets/icon-source.png` | Icon regeneration source |

---

<p align="center">
  <img src="app/icon.png" alt="WCH" width="48" height="48" /><br/>
  <strong>World Cup Hub</strong><br/>
  <a href="https://wchub26.vercel.app">wchub26.vercel.app</a><br/>
  <sub>
    <a href="https://github.com/liad07/crack-apps.github.io">Crack Apps</a> ·
    <a href="https://github.com/liad07/StreamNet">StreamNet</a> ·
    <a href="https://github.com/liad07/WC26-HUB">WC26-HUB</a>
  </sub>
</p>
