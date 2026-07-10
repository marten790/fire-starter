# Fire Starter — Project Context

> **Living document.** Updated as we build. This is the single source of truth for where the project stands.

## What we're building

A **kiln firing dashboard** for **Delores** — a manual (dial 1–6) front-loading electric pottery kiln. Primary device: **iPad Pro 11" (3rd gen)**. Design source: **Figma design system**.

Two firing types:
1. **Bisque** — Cone 06, ~7–8 hrs, peak ~893°C, candling + door ajar first hour, **no soak**
2. **Glaze** — Cone 6 or 7, ~9–10 hrs, peak ~1072°C, **30 min soak** when cone 6 starts bending

Tracking today: paper log sheets + Orton cones + external thermocouple meter (°C). App replaces the paper log and adds graphs, reminders, and history.

## Project status

| Phase | Status | Notes |
|-------|--------|-------|
| Discovery & requirements | **Complete** | All open questions answered |
| Design (Figma → tokens) | **Ready to start** | Design System 2.0 linked; connect Figma Desktop MCP next |
| Tech setup | Not started | PWA, **offline-first** (garage, no Wi‑Fi at kiln) |
| MVP build | Not started | Scope locked from answers + paper logs |
| iPad testing | Not started | iPad Pro 11" (3rd gen) |

**Last updated:** 2026-07-10

## Decisions made

| Decision | Choice | Date | Rationale |
|----------|--------|------|-----------|
| App name | **Fire Starter** | 2026-07-10 | Confirmed by designer |
| Platform | Web app / PWA | 2026-07-10 | iPad-first; no App Store needed for v1 |
| Offline | Required for MVP | 2026-07-10 | Garage kiln; no Wi‑Fi/Bluetooth on kiln |
| Theme | **Light UI** | 2026-07-10 | Designer preference for garage use |
| Units | °C + **kWh** on readings | 2026-07-10 | Thermocouple meter; matches paper sheets |
| Dial | 1–6 (allow half steps e.g. 3/4) | 2026-07-10 | Matches kiln + paper logs |
| Firing names | Date-based | 2026-07-10 | User preference |
| Kiln name | Delores | 2026-07-10 | From existing paper logs |
| Design system | [Design System 2.0 (Copy)](https://www.figma.com/design/1n1CyxHO40140szSX27TCQ/Design-System-2.0--Copy-?node-id=0-1&m=dev) | 2026-07-10 | Figma source of truth |
| Repo | [marten790/fire-starter](https://github.com/marten790/fire-starter) | 2026-07-10 | — |

## Open questions (remaining)

None for discovery. Next: connect Figma Desktop MCP and extract tokens, then scaffold the app.

---

## Answers (from designer)

### About you & your kiln

| # | Answer |
|---|--------|
| 1 | Make/model unknown |
| 2 | Front-loading; chamber **48 × 53 × 68 cm** |
| 3 | Electric |
| 4 | **New elements** (~7 firings so far); known cold spot at bottom (extra shelf helps) |
| 5 | External meter via **thermocouple**, **°C** |
| 6 | **Orton** — bisque **06**, glaze **6 or 7** (large cones / LRB) |
| 7 | Garage; fully manual kiln — **no Wi‑Fi or Bluetooth** at kiln |
| 8 | **iPad Pro 11" (3rd generation)** |

### Bisque firing workflow

| # | Answer |
|---|--------|
| 9 | Cone **06**; peak on meter ~**893°C** |
| 10 | **7–8 hours** |
| 11 | Start slower; **candling** upfront for moisture; **no soak** on bisque |
| 12 | Check every **15–30 minutes** |
| 13 | Peephole open + **door ajar first hour**; close peephole once kiln reaches **100°C** |
| 14 | Shut off when **cone has bent over** |
| 15 | Open kiln once cooled to **150°C** |
| 16 | Some cracking — may be making-related |

### Glaze firing workflow

| # | Answer |
|---|--------|
| 17 | Cone **6 or 7**; peak on meter ~**1072°C** |
| 18 | **9–10 hours** |
| 19 | **30 min soak** on glaze only |
| 20 | Cones: **5** bottom; **5, 6, 7** middle (peephole view); **7** top |
| 21 | Many glazes, same clay bodies; firings named by **date** |
| 22 | When **cone 6 starts bending** → start soak |
| 23 | **Natural** cool; no temp hold on cool-down |
| 24 | Some pinholes; no major problems |

### Dashboard must-haves (MVP)

| # | Answer |
|---|--------|
| 25 | Separate start for bisque vs glaze |
| 26 | Elapsed timer — yes |
| 27 | Big temp entry + show last reading — yes |
| 28 | Dial **1–6** |
| 29 | Quick notes / presets — yes; **no voice** |
| 30 | Reminders every **30–60 min** — yes |
| 31 | Pre-start checklist — yes |
| 32 | Cone results: **per shelf + overall** |
| 33 | Photos — yes |
| 34 | Peak temp (auto from logs + editable) — yes |
| 35 | Outcome rating — yes |
| 36 | Load record (count / notes / shelf) — yes |
| 37 | History: filter bisque/glaze + search by date — yes |
| 38 | Compare two firings — yes |
| 39 | Copy last firing — **no** |
| 40 | Element / maintenance counter — yes |

### Nice-to-haves (post-MVP or soon after)

| # | Answer |
|---|--------|
| 41 | Clay & glaze library — yes |
| 42 | Export PDF — yes |
| 43 | Multiple kilns later — yes |
| 44 | Shared access (others) — yes |
| 45 | Weather / season notes — yes |
| 46 | Locked-iPad notifications — yes |
| 53 | **Graphs** of firing data + compare firings — yes (priority) |

### Design & success

| # | Answer |
|---|--------|
| 47 | Figma Desktop MCP: `http://127.0.0.1:3845/mcp` + file [Design System 2.0 (Copy)](https://www.figma.com/design/1n1CyxHO40140szSX27TCQ/Design-System-2.0--Copy-?node-id=0-1&m=dev) |
| 48 | **Light UI** |
| 49 / name | **Fire Starter** |
| 50 | Use design system from Figma |
| 51 | Success: useful enough to keep using |
| 52 | Biggest pain today: **memory** (paper + remembering) |
| kWh | **Yes** — log electric units on readings (like paper sheets) |

---

## Insights from paper log sheets (photos)

Your current sheets are the best blueprint for the app. Digital MVP should mirror this structure:

### Heating log (per row)
- Elapsed time (auto-calculated from start)
- Clock time
- Dial setting (1–6, including half steps like 3/4, 5/4)
- Thermocouple °C
- Electric units **kWh** (used on glaze logs)
- Witness cone notes
- Notes (e.g. OPEN DOOR, CLOSE DOOR, COLDER DAY)

### Peak / soak block
- Top temp
- Soak start (time + temp + dial)
- Soak end (time + temp)
- Switch off time
- Live cone events: e.g. “cone 4 started / down” with time + °C

### Cooling log
- Checkpoints: **1h, 2h, 4h, 8h** after off (time + °C + notes)
- Open kiln rule: **≤ 150°C**

### Results
- Final witness cones: **bottom / mid / top**
- Clay body outcome
- Glaze outcome
- Defects / notes
- **Adjustments for next firing** (show this when starting the next fire of same type)
- General notes / how full the kiln was

### Reference assets from photos
- Orton cone chart (°C / °F by heating rate) — good in-app reference later
- Three side peepholes on kiln (bottom / mid / top)
- Wall isolator switch (manual power) — checklist item: “power ON”

---

## Feature backlog (prioritized)

### MVP — replace the paper log on iPad
- [ ] Home: Start **Bisque** or **Glaze** (kiln: Delores)
- [ ] Pre-start checklist (cones placed, door ajar, peephole open, power on, meter connected…)
- [ ] Active firing screen: elapsed timer, last temp, big “Log reading” (dial + °C + **kWh** + note)
- [ ] Reminder every 30–60 min while firing is active
- [ ] Candling helpers: door ajar / close at 100°C prompts
- [ ] Cone event log during fire (started / down + time + temp)
- [ ] Glaze soak controls (start soak when cone 6 starts; 30 min timer)
- [ ] Switch off + cooling log (1 / 2 / 4 / 8 h)
- [ ] Results: bottom/mid/top cones, outcomes, defects, adjustments, photos, rating
- [ ] History list (filter type, search date)
- [ ] Simple **temp vs time graph** for one firing
- [ ] Element firing counter (~7 so far; alert threshold later)
- [ ] Offline-capable storage (garage)

### Next
- [ ] Compare two firings (overlay graphs)
- [ ] Show “adjustments from last firing” on new start
- [ ] Glaze / clay library
- [ ] PDF export
- [ ] Multi-user / multi-kiln
- [ ] Push notifications when iPad locked
- [ ] Orton cone temperature reference chart in-app

## Tech stack (tentative)

| Layer | Likely choice |
|-------|----------------|
| UI | React + Figma design tokens |
| Styling | CSS variables / Tailwind from design system |
| Data | Local-first (IndexedDB); sync later if shared access needed |
| Deploy | PWA; Add to Home Screen on iPad |
| Target | iPad Pro 11" Safari |

## File map

```
fire-starter/
├── PROJECT_CONTEXT.md
├── INSTRUCTIONS.md
├── README.md
└── docs/
    ├── OVERVIEW.md
    ├── REQUIREMENTS_QUESTIONS.md
    ├── FIRING_RESEARCH.md
    ├── TECH_RECOMMENDATIONS.md
    └── CURSOR_GETTING_STARTED.md
```

## Session log

| Date | What we did |
|------|-------------|
| 2026-07-10 | Created project docs, research, discovery questions; initialized repo |
| 2026-07-10 | Recorded full requirements answers + paper log / kiln photo insights; drafted MVP backlog |
| 2026-07-10 | Locked theme (light), kWh logging, and Figma Design System 2.0 link; discovery complete |
