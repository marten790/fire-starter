# Cursor getting started — for designers (first project)

## Is "research mode" the best way to start?

**Short answer:** Start with **Agent mode** and a clear brief (which you've already given). Use **Ask mode** when you only want explanations. You don't need a special "research mode" — discovery happens through chat + the docs we created.

### Modes in plain language

| Mode | Icon / name | Use when |
|------|-------------|----------|
| **Agent** | Default builder | "Create the docs", "Build the home screen", "Commit and push" — *can edit files and run commands* |
| **Ask** | Ask | "What is bisque firing?", "Explain this code" — *read-only, no changes* |
| **Plan** | Plan | "Should we use a database or local storage?" — *collaborative plan before big builds* |

**Your path:**

1. ✅ **Discovery** — Answer requirements questions (now)
2. **Plan** (optional) — One session to confirm MVP scope after your answers
3. **Agent** — Build screen by screen; test on iPad
4. **Ask** — Anytime you're stuck on vocabulary or "what does this mean?"

## First-time Cursor tips

### 1. Talk like you talk to a colleague

Good prompts:

- "Build the active firing screen with a big button to log temperature"
- "Use these Figma colors: background #1a1a1a, accent #e85d04"
- "Explain what you just did in simple terms"
- "Commit and push"

Less helpful:

- "Make it good" (too vague)
- Pasting entire Figma files without saying what to extract

### 2. One thing at a time

Ask for one screen or one feature per message when learning. Example order:

1. Project setup + empty home page
2. "Start bisque firing" flow
3. Log temperature reading
4. End firing + cone results
5. History list

### 3. Use `@` to point at files

Type `@PROJECT_CONTEXT.md` or `@docs/REQUIREMENTS_QUESTIONS.md` in chat so the AI reads the latest decisions.

### 4. Review changes

Cursor shows a **diff** when files change. You don't need to understand every line — check that filenames and docs match what you expected.

### 5. Undo mistakes

- Say "revert the last change" or use Git history on GitHub
- We commit often so you can always go back

### 6. Terminal is optional for you

The assistant can run git, install packages, and start the dev server. You can learn terminal commands later if you want.

## Suggested first sessions

| Session | Goal |
|---------|------|
| 1 (today) | Answer discovery questions; confirm MVP |
| 2 | Share Figma link or export tokens (colors, fonts) |
| 3 | Scaffold app + iPad-friendly home screen |
| 4 | Active firing flow (bisque) |
| 5 | Test on iPad Safari; tweak tap sizes |

## Glossary (you'll see these words)

| Term | Meaning |
|------|---------|
| **Repo** | This project folder + GitHub copy |
| **Commit** | Saved snapshot of changes |
| **Push** | Upload commits to GitHub |
| **MVP** | Minimum viable product — smallest useful version |
| **PWA** | Website that can be installed on iPad home screen |
| **Component** | Reusable UI piece (button, card, header) |
| **Token** | Design system value (color, font size, spacing) |

## When something breaks

Tell the assistant:

1. What you were trying to do
2. What you expected
3. What happened (error text or screenshot)
4. Whether you're on PC or iPad

We'll fix it step by step — no judgment.
