# Firestarter

Kiln firing dashboard for **Delores** (manual electric pottery kiln) — built for **iPad**, designed from Figma.

## Status

**Live:** https://fire-starter-ten.vercel.app  

See **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** for what’s built, backlog, decisions, and data storage notes.

## Use on iPad (Safari)

1. Open https://fire-starter-ten.vercel.app in **Safari**
2. Tap **Share** → **Add to Home Screen** → **Add**
3. Open **Firestarter** from the Home Screen
4. Allow **notifications** when prompted (for check reminders with sound)
5. Join garage Wi‑Fi when firing — Delores itself does not need Wi‑Fi

**Tip:** After an app update, pull to refresh in Safari once if the Home Screen icon looks outdated. Your firings stay on the iPad unless you clear website data — use **Export** for a WhatsApp/Files backup.

## Run locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

### Windows PowerShell (“running scripts is disabled”)

Use `npm.cmd run dev`, double-click `dev.cmd`, or:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Docs

| Document | Purpose |
|----------|---------|
| [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | **Source of truth** — status, features, decisions, backlog |
| [INSTRUCTIONS.md](./INSTRUCTIONS.md) | Commit/push/deploy + keep docs updated |
| [docs/OVERVIEW.md](./docs/OVERVIEW.md) | Short project summary |
| [docs/DESIGN_TOKENS.md](./docs/DESIGN_TOKENS.md) | Figma → CSS tokens |
| [docs/REQUIREMENTS_QUESTIONS.md](./docs/REQUIREMENTS_QUESTIONS.md) | Discovery questions |
| [docs/FIRING_RESEARCH.md](./docs/FIRING_RESEARCH.md) | What to track during firings |
| [docs/TECH_RECOMMENDATIONS.md](./docs/TECH_RECOMMENDATIONS.md) | PWA vs native |
| [docs/CURSOR_GETTING_STARTED.md](./docs/CURSOR_GETTING_STARTED.md) | First-time Cursor guide |

## Repository

https://github.com/marten790/fire-starter
