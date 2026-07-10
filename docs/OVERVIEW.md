# Project overview

## The problem

Firing a manual kiln means juggling a dial, a temperature meter, pyrometric cones, and memory. Without a log, it's hard to repeat a good firing or understand why something went wrong.

## The solution

**Fire Starter** is a dashboard you use on your **iPad** while firing (and after) to:

- Record what you're doing during bisque and glaze firings
- Store temperature readings, cone results, and notes
- Review past firings to improve consistency

## Your setup (confirmed)

| Item | Detail |
|------|--------|
| Kiln | **Delores** — front-loading electric, chamber 48×53×68 cm, dial **1–6** |
| Location | Garage (no Wi‑Fi at kiln → offline-first app) |
| Temperature | External thermocouple meter, **°C** |
| Cones | Orton — bisque **06**, glaze **6/7**; packs on bottom / mid / top |
| Bisque | ~7–8 hrs, peak ~893°C, candle + door ajar first hour, no soak |
| Glaze | ~9–10 hrs, peak ~1072°C, **30 min soak** when cone 6 starts bending |
| Device | iPad Pro 11" (3rd gen) |
| Today | Paper heating + cooling log sheets (app should mirror these) |

## Design approach

- You work in **Figma** with a design system
- We translate colors, type, spacing, and components into the app
- iPad-first layout: large tap targets, readable at arm's length near the kiln

## What we're not building (unless you ask later)

- Automatic temperature from the kiln (no digital controller hookup in v1)
- Replacing professional kiln controller software
- A social network or marketplace

## Success looks like

1. You can start a firing on the iPad in a few taps
2. You can log readings without fighting the UI while wearing gloves
3. After the fire, cone results and notes are saved and searchable
4. Next bisque or glaze fire, you can glance at what worked last time

## Next step

Answer the questions in **[REQUIREMENTS_QUESTIONS.md](./REQUIREMENTS_QUESTIONS.md)** (the assistant will ask them in chat). Those answers drive the first screen designs and MVP scope.
