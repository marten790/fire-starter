# Project overview

## The problem

Firing a manual kiln means juggling a dial, a temperature meter, pyrometric cones, and memory. Without a log, it's hard to repeat a good firing or understand why something went wrong.

## The solution

**Firestarter** is a dashboard you use on your **iPad** while firing (and after) to:

- Start bisque or glaze with a pre-start checklist  
- Log dial, °C, kWh, notes, and cone events  
- Get check reminders (notification + sound, best-effort)  
- Graph temperature, then cool and record results  
- Browse history and export CSV / JSON backups  

**Live:** https://fire-starter-ten.vercel.app  

Full status, backlog, and decisions: **[PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)**.

## Your setup (confirmed)

| Item | Detail |
|------|--------|
| Kiln | **Delores** — front-loading electric, chamber 48×53×68 cm, dial **1–6** |
| Location | Garage (kiln not networked → data on the iPad) |
| Temperature | External thermocouple meter, **°C** |
| Cones | Orton — bisque **06**, glaze **6/7** (app glaze toggles: **5 & 6**) |
| Bisque | ~7–8 hrs, peak ~893°C, candle + door ajar first hour, no soak |
| Glaze | ~9–10 hrs, peak ~1072°C, **30 min soak** when cone 6 starts bending |
| Device | iPad Pro 11" (3rd gen) |
| Data | Browser **localStorage**; export before clearing Safari data |

## Design approach

- High-fidelity screens: [Product Template (Figma)](https://www.figma.com/design/w9ZZXytE6QPLmN0DGpGUyn/Product-Template--Copy-?node-id=1-10&m=dev)  
- Tokens from Design System / Inkblot in `src/styles/tokens.css`  
- iPad-first: large tap targets, light UI, Dashboard + History nav  

## What we're not building (unless you ask later)

- Automatic temperature from the kiln (no controller hookup in v1)  
- Replacing professional kiln controller software  
- True locked-device push without a notification server  
- Settings / Help tabs (deferred)  

## Success looks like

1. Start a firing on the iPad in a few taps  
2. Log readings without fighting the UI near the kiln  
3. After the fire, cones and notes are saved and findable in History  
4. Next fire, you can glance at what worked last time (adjustments / compare — upcoming)  
