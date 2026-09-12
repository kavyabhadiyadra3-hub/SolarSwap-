# SolarSwap — Renewable Energy P2P Trading Marketplace

A college hackathon project: a **simulated** peer-to-peer solar energy marketplace.
No real electricity, smart meters, or real payments are involved — everything is
a software simulation for demonstration purposes.

## Phase 1 — Project Shell (this stage)

What exists right now:
- React + Vite + Tailwind CSS project, fully configured
- Brand color tokens (`solar` = amber/gold, `eco` = green, `ink` = dark text)
- `Inter` font loaded
- A reusable `Navbar` and `Footer`
- A placeholder home screen just to prove everything renders

Nothing else (auth, dashboards, marketplace, backend) exists yet — that comes in later phases.

## How to run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To create a production build:

```bash
npm run build
```

## Folder structure

```
solarswap/
├─ index.html
├─ tailwind.config.js       ← brand colors + font live here
├─ postcss.config.js
├─ vite.config.js
├─ package.json
└─ src/
   ├─ main.jsx              ← React entry point
   ├─ index.css             ← Tailwind base + global styles
   ├─ App.jsx                ← app shell (renders Navbar + placeholder + Footer)
   ├─ components/
   │  └─ layout/
   │     ├─ Navbar.jsx
   │     └─ Footer.jsx
   ├─ pages/                 ← empty for now, real pages start Phase 2
   ├─ layouts/                ← empty for now
   └─ assets/                 ← empty for now
```

## Progress log

- **Phase 1 (done):** Frontend foundation — React + Vite + Tailwind shell, brand
  colors, Navbar/Footer, placeholder home screen.
- **Phase 2 (next):** Landing page content.
