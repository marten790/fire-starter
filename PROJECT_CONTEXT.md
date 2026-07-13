# Firestarter — Project Context

> **Living document.** Updated as we build. This is the single source of truth for where the project stands.

## What we're building

A **kiln firing dashboard** for **Delores** — a manual (dial 1–6) front-loading electric pottery kiln. Primary device: **iPad Pro 11" (3rd gen)**.

- **App name:** Firestarter  
- **Live URL:** https://fire-starter-ten.vercel.app  
- **Repo:** https://github.com/marten790/fire-starter  
- **Design:** [Product Template (Copy)](https://www.figma.com/design/w9ZZXytE6QPLmN0DGpGUyn/Product-Template--Copy-?node-id=1-10&m=dev) + Inkblot tokens from Design System 2.0  

Two firing types:
1. **Bisque** — Cone 06, ~7–8 hrs, peak ~893°C, candling + door ajar first hour, **no soak**
2. **Glaze** — Cone 6 / 7, ~9–10 hrs, peak ~1072°C, **30 min soak** when cone 6 starts bending

Tracking today: paper log sheets + Orton cones + external thermocouple meter (°C). The app replaces the paper log and adds graphs, reminders, history, and export.

## Project status

| Phase | Status | Notes |
|-------|--------|-------|
| Discovery & requirements | **Complete** | Answers recorded below |
| Design (Figma → UI) | **In use** | Product Template UI + tokens in `src/styles/tokens.css` |
| Tech setup | **Deployed** | Vite + React + TS + PWA on Vercel |
| MVP build | **Strong progress** | See “What’s built” |
| iPad testing | **Active** | Safari → Add to Home Screen |

**Last updated:** 2026-07-13

## What’s built (current product)

### Navigation & chrome
- Brand: **Firestarter** + kiln mark
- Bottom nav: **Dashboard** · **History** (Settings / Help deferred)
- Light theme, iPad-width shell (~834px)

### Dashboard
- Current firing card (timer, last/peak/logs, next check, open / delete)
- Empty state when no fire is running
- Start **bisque** / **glaze** cards → pre-start checklist → timer starts
- **Export** card: CSV (readings) + full JSON backup (share via WhatsApp / Files)

### Pre-start checklist
- Must check all items (or **Select all** / **Clear all**) before Start firing
- **Bisque order:** Kiln loaded → Cone 06 placed → Meter connected → Peephole open → Door ajar for candling → Dial on 1 → Power ON
- **Glaze:** same flow with glaze cone / door wording
- Snapshot saved on the firing

### Active firing
- Session card: type, date name, large timer, status pill, cone target, started time, last reading
- Temperature graph (°C vs elapsed time)
- Log reading: dial 1–6 (half steps), °C, kWh, notes
- **Cone events (toggles):**
  - Bisque: 07 / 06 started & down
  - Glaze: **5 and 6 only** (started & down); cone 6 hints for soak / target
- **Bisque · Candling:** countdown to close door (1h), peephole close ~100°C, toggles, alerts + chime
- Check reminders: 15 / 30 / 60 min (bisque defaults to 15 on start)
- End firing → cooling; delete firing
- Heating log: **single-line** rows + small **Delete** (with confirm); graph updates

### Reminders / notifications
- Interval reminders while status is `running`
- In-app alert + louder chime + vibrate when available
- Browser / service-worker **notification with system sound** when permission granted
- Screen **wake lock** while a firing + reminders are active (helps timers stay alive)
- Logging a reading resets the next reminder
- **Limit:** true push with iPad fully locked still needs a backend push service; best with Home Screen app + screen on / app open

### Cooling & results
- End-of-fire: soak start/end, switch off, top temp
- Cooling log: 1h / 2h / 4h / 8h
- Results: cone bottom / mid / top, clay & glaze outcome, defects, adjustments
- Done → dashboard; delete firing

### History
- Separate History tab
- Filter by type + date; Export CSV in toolbar
- Rows with peak temp badge, name, meta, View details, compact Delete

### Data & persistence
- **Browser `localStorage` on the device** (not on Vercel)
  - `fire-starter.firings.v1` — firings
  - `fire-starter-reminders` — reminder settings
  - `fire-starter.deleted-paper.v1` — deleted paper-import ids
- App **deploys do not wipe** local data
- Data is lost if Safari site data is cleared, private mode, or a different device/browser
- **Export CSV / JSON** before risky clears; paper logs seeded into history (8 imports)

### Deploy workflow
- Commit + push to `main` → GitHub
- `npx vercel --prod` (or GitHub → Vercel) → https://fire-starter-ten.vercel.app
- After iPad cache issues: refresh Safari, then reopen Home Screen app

## Decisions made

| Decision | Choice | Date | Rationale |
|----------|--------|------|-----------|
| App name | **Firestarter** | 2026-07-13 | Confirmed (was “Fire Starter”) |
| Platform | Web app / PWA | 2026-07-10 | iPad-first; no App Store for v1 |
| Offline / storage | **localStorage** | 2026-07-10 | Garage; kiln not networked |
| Theme | **Light UI** | 2026-07-10 | Garage use |
| Units | °C + **kWh** | 2026-07-10 | Meter + paper sheets |
| Dial | 1–6 (half steps) | 2026-07-10 | Matches kiln |
| Firing names | Date-based | 2026-07-10 | User preference |
| Kiln name | Delores | 2026-07-10 | Paper logs |
| UI design | [Product Template](https://www.figma.com/design/w9ZZXytE6QPLmN0DGpGUyn/Product-Template--Copy-?node-id=1-10&m=dev) | 2026-07-13 | High-fidelity screens |
| Tokens | Inkblot / Design System 2.0 | 2026-07-10 | Colors, type, spacing |
| Nav (v1) | Dashboard + History only | 2026-07-13 | Settings / Help later |
| Glaze cone toggles | **5 & 6 only** | 2026-07-13 | User request |
| Bisque checklist order | Loaded → cone → meter → peephole → door → dial 1 → power | 2026-07-13 | User request |
| Export | CSV + JSON backup | 2026-07-11 | WhatsApp / safety copy |
| Repo | [marten790/fire-starter](https://github.com/marten790/fire-starter) | 2026-07-10 | — |

## Feature backlog (prioritized)

### MVP remaining
- [ ] Glaze soak controls (dedicated 30 min timer when cone 6 starts)
- [ ] Element firing counter (~7 so far; alert threshold later)
- [ ] Photos on results
- [ ] Outcome rating UI polish (if not fully exposed)

### Done (MVP)
- [x] Dashboard start bisque / glaze
- [x] Pre-start checklist (+ select all)
- [x] Active log (dial + °C + kWh + notes) + delete reading
- [x] Reminders 15/30/60 + notification sound (best-effort)
- [x] Bisque candling helpers
- [x] Cone events (bisque 07/06; glaze 5/6)
- [x] Cooling log + results
- [x] History filters + export
- [x] Temp vs time graph
- [x] localStorage offline storage
- [x] Figma Product Template redesign pass

### Next
- [ ] Compare two firings (overlay graphs)
- [ ] Show “adjustments from last firing” on new start
- [ ] Settings / Help tabs
- [ ] Glaze / clay library
- [ ] PDF export
- [ ] Multi-user / multi-kiln
- [ ] True push when iPad locked (needs push server)
- [ ] Orton cone reference chart in-app
- [ ] Import JSON backup into the app

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React + TypeScript (Vite) |
| Styling | CSS variables (`tokens.css`) + screen CSS |
| Data | localStorage (firings + reminders) |
| PWA | vite-plugin-pwa (Add to Home Screen) |
| Deploy | Vercel production alias `fire-starter-ten.vercel.app` |
| Target | iPad Pro 11" Safari / Home Screen |

## File map

```
fire-starter/
├── PROJECT_CONTEXT.md          ← this file (source of truth)
├── INSTRUCTIONS.md             ← how we work + always update docs
├── README.md
├── package.json
├── vite.config.ts
├── vercel.json
├── src/
│   ├── App.tsx                 ← screens, reminders, nav
│   ├── styles/tokens.css
│   ├── types/firing.ts
│   ├── lib/
│   │   ├── firings.ts          ← load/save, create, complete
│   │   ├── checklist.ts        ← pre-start items
│   │   ├── candling.ts         ← bisque door / peephole helpers
│   │   ├── reminders.ts        ← intervals, notifications, wake lock
│   │   └── exportData.ts       ← CSV + JSON export
│   ├── data/paperFirings.ts    ← imported paper logs
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── ActiveFiringScreen.tsx
│   └── components/             ← BrandMark, BottomNav, forms, etc.
├── public/
└── docs/
```

---

## Answers (from designer) — discovery archive

### About you & your kiln

| # | Answer |
|---|--------|
| 1 | Make/model unknown |
| 2 | Front-loading; chamber **48 × 53 × 68 cm** |
| 3 | Electric |
| 4 | **New elements** (~7 firings so far); cold spot at bottom |
| 5 | External meter via **thermocouple**, **°C** |
| 6 | **Orton** — bisque **06**, glaze **6 or 7** |
| 7 | Garage; kiln has **no Wi‑Fi/Bluetooth** |
| 8 | **iPad Pro 11" (3rd generation)** |

### Bisque / glaze (summary)

- Bisque: candle, door ajar first hour, close peephole ~100°C, no soak, ~7–8h, ~893°C  
- Glaze: soak 30 min when cone 6 starts, ~9–10h, ~1072°C; cones historically 5 / 5-6-7 / 7 (app toggles currently **5 & 6** only)  
- Open kiln when cooled to **≤ 150°C**

Full Q&A tables remain in `docs/REQUIREMENTS_QUESTIONS.md` and earlier session notes.

### Paper log blueprint

Heating log · peak/soak · cooling 1/2/4/8h · results (bottom/mid/top cones, outcomes, adjustments). See also `docs/FIRING_RESEARCH.md`.

## Working rules (for the assistant)

1. After meaningful product changes: **update `PROJECT_CONTEXT.md`** (and README if user-facing).
2. **Commit and push** to GitHub; **deploy to Vercel** when shipping for iPad.
3. Prefer small, testable steps; keep light UI and Delores/kiln facts accurate.
4. Do not invent kiln behavior that contradicts discovery answers without asking.

## Session log

| Date | What we did |
|------|-------------|
| 2026-07-10 | Docs, discovery, tokens, Vite PWA, paper import, Vercel, end-of-fire, cones |
| 2026-07-11 | Reminders; CSV/JSON export; export at top of dashboard |
| 2026-07-13 | Figma Product Template redesign (Firestarter, Dashboard/History nav); delete heat log; checklist order; glaze cones 5/6; notification sound + wake lock; compact delete; single-line heat log; remove loaded-by meta; checklist select all; **docs refresh** |
