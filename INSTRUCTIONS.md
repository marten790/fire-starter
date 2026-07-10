# Working instructions (for you and for the AI assistant)

## Git workflow — commit and push after every change

**Rule:** After any meaningful change to this project (new files, doc updates, code), **commit and push to GitHub** so nothing is lost and you can always roll back.

Remote repository: **https://github.com/marten790/fire-starter**

### What you can ask the assistant

In Cursor chat, you can say:

- *"Commit and push"* — after a session or when docs/code changed
- *"What changed since last commit?"* — quick status check

The assistant should run `git add`, `git commit`, and `git push` for you. You do not need to use the terminal yourself unless you want to learn it later.

### If push fails

1. Make sure you're signed into GitHub in Cursor / Git Credential Manager.
2. Tell the assistant the error message — we'll fix it step by step.

## How we build (designer-friendly)

1. **Answer discovery questions** in chat (from `docs/REQUIREMENTS_QUESTIONS.md`).
2. **Update `PROJECT_CONTEXT.md`** with your answers and decisions.
3. **Design in Figma** — we align the app to your design system.
4. **Build in small steps** — one screen or feature at a time; test on iPad in Safari.
5. **Commit and push** after each step.

## Cursor modes (quick reference)

| Mode | When to use |
|------|-------------|
| **Agent** (default for building) | "Add the firing log screen", "Fix this button" |
| **Ask** | "What does this file do?", "Explain bisque vs glaze" — no file changes |
| **Plan** | Big decisions: "Should we use a database?" before coding |

**Recommendation for your first project:** Start in **Agent** with clear, small requests. Use **Ask** when you're curious but don't want files changed. See `docs/CURSOR_GETTING_STARTED.md` for a full walkthrough.

## Files to keep updated

| File | Who updates | When |
|------|-------------|------|
| `PROJECT_CONTEXT.md` | Assistant (with your input) | After decisions or completed work |
| `docs/REQUIREMENTS_QUESTIONS.md` | Assistant | When we add new questions |
| Code / design tokens | Assistant | During build phases |

## If `npm run dev` fails on Windows

PowerShell sometimes blocks npm. Use `npm.cmd run dev` or double-click `dev.cmd`. See README for the one-time ExecutionPolicy fix.