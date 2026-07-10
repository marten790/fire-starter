# Fire Starter — Project Context

> **Living document.** Updated as we build. This is the single source of truth for where the project stands.

## What we're building

A **kiln firing dashboard** for a manual (dial-controlled) pottery kiln. Primary device: **iPad**. Design source: **Figma design system**.

Two firing types:
1. **Bisque firing** — first fire; converts raw clay to ceramic
2. **Glaze firing** (main firing) — second fire; matures glazes

Tracking methods today:
- Manual dial on the kiln
- Pyrometric (Orton) cones
- External temperature meter

## Project status

| Phase | Status | Notes |
|-------|--------|-------|
| Discovery & requirements | **In progress** | Answering questions in `docs/REQUIREMENTS_QUESTIONS.md` |
| Design (Figma → tokens) | Not started | Waiting on requirements |
| Tech setup | Not started | Likely PWA (see `docs/TECH_RECOMMENDATIONS.md`) |
| MVP build | Not started | — |
| iPad testing | Not started | — |

**Last updated:** 2026-07-10

## Decisions made

| Decision | Choice | Date | Rationale |
|----------|--------|------|-----------|
| Platform (tentative) | Web app / PWA | 2026-07-10 | Best for iPad dashboard, no App Store, fast iteration for first project |
| User | Designer, first code project | 2026-07-10 | Step-by-step guidance required |
| Repo | [marten790/fire-starter](https://github.com/marten790/fire-starter) | 2026-07-10 | — |

## Open questions

All discovery questions live in **`docs/REQUIREMENTS_QUESTIONS.md`**. Answers will be recorded in the **Answers** section below as you respond.

## Answers (from designer)

_Fill in as questions are answered._

### About you & your kiln
- 

### Bisque firing workflow
- 

### Glaze firing workflow
- 

### Dashboard must-haves
- 

### Nice-to-haves
- 

### Design & iPad
- 

## Feature backlog (draft)

_Prioritized after requirements are answered._

### MVP (likely)
- [ ] Start / end a firing session (bisque or glaze)
- [ ] Log temperature readings over time (manual entry from your meter)
- [ ] Log cone results at end of firing
- [ ] Firing history list
- [ ] Notes per firing (load, glazes, issues)

### Later
- [ ] Firing schedules / ramp reminders
- [ ] Photos of cones and results
- [ ] Element / maintenance counter
- [ ] Glaze & clay body library
- [ ] Offline support (PWA)
- [ ] Export / print firing log

## Tech stack (tentative)

_To be confirmed after requirements._

| Layer | Likely choice |
|-------|----------------|
| UI | React + your Figma design tokens |
| Styling | Tailwind CSS or CSS from Figma |
| Data | Local-first (browser storage or simple backend) |
| Deploy | Static hosting; open in Safari on iPad, Add to Home Screen |

## File map

```
fire-starter/
├── PROJECT_CONTEXT.md          ← You are here (progress tracker)
├── INSTRUCTIONS.md             ← How we work (commit/push rules)
├── README.md                   ← Project intro
└── docs/
    ├── OVERVIEW.md             ← Plain-language project summary
    ├── REQUIREMENTS_QUESTIONS.md
    ├── FIRING_RESEARCH.md      ← What potters track & why
    ├── TECH_RECOMMENDATIONS.md ← iPad / PWA vs native
    └── CURSOR_GETTING_STARTED.md
```

## Session log

| Date | What we did |
|------|-------------|
| 2026-07-10 | Created project docs, research, discovery questions; initialized repo |
