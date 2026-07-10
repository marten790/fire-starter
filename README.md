# Fire Starter

A kiln firing dashboard for manual pottery kilns — built for iPad, designed from your Figma design system.

## Status

**Live on iPad-ready hosting:** https://fire-starter-ten.vercel.app

## Use on iPad (Safari)

1. Open https://fire-starter-ten.vercel.app in **Safari**
2. Tap **Share** → **Add to Home Screen** → **Add**
3. Open **Fire Starter** from your home screen
4. Join garage Wi‑Fi when firing — Delores itself does not need Wi‑Fi

## Run locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

### Windows PowerShell error (“running scripts is disabled”)

If you see:

> `npm.ps1 cannot be loaded because running scripts is disabled`

Use either:

1. **Double-click** `dev.cmd` in this folder, or in the terminal run:
   ```bash
   npm.cmd run dev
   ```
2. Or fix PowerShell once (recommended), then open a **new** terminal:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```

Then `npm run dev` will work normally.

## Docs

| Document | Purpose |
|----------|---------|
| [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | Progress tracker and decisions |
| [INSTRUCTIONS.md](./INSTRUCTIONS.md) | Commit/push workflow and how we collaborate |
| [docs/OVERVIEW.md](./docs/OVERVIEW.md) | Project summary |
| [docs/DESIGN_TOKENS.md](./docs/DESIGN_TOKENS.md) | Figma → CSS tokens |
| [docs/REQUIREMENTS_QUESTIONS.md](./docs/REQUIREMENTS_QUESTIONS.md) | Discovery questions (answered) |
| [docs/FIRING_RESEARCH.md](./docs/FIRING_RESEARCH.md) | What to track during firings |
| [docs/TECH_RECOMMENDATIONS.md](./docs/TECH_RECOMMENDATIONS.md) | iPad / PWA vs native |
| [docs/CURSOR_GETTING_STARTED.md](./docs/CURSOR_GETTING_STARTED.md) | First-time Cursor guide |

## Repository

https://github.com/marten790/fire-starter
