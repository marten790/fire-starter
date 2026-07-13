# Working instructions (for you and for the AI assistant)

## Always keep project docs up to date

**Rule:** After any meaningful product or process change, update **`PROJECT_CONTEXT.md`** (and **`README.md`** when the user-facing story changes). Document:

- What was built or changed  
- Decisions (name, UX, kiln facts, storage, deploy)  
- Backlog checkboxes  
- Session log date line  

Do this in the **same session** as the code change — not later.

## Git workflow — commit and push after every change

**Rule:** After any meaningful change (docs, code, design), **commit and push to GitHub**.

Remote: **https://github.com/marten790/fire-starter**

### Deploy for iPad

When shipping something to test on the iPad:

1. Commit + push to `main`  
2. Deploy production: `npx vercel --prod` (alias: https://fire-starter-ten.vercel.app)

### What you can ask the assistant

- *"Commit and push"*  
- *"Deploy to Vercel"*  
- *"Update the project docs"*  
- *"What changed since last commit?"*

## How we build (designer-friendly)

1. Confirm kiln / UX details in chat; record them in `PROJECT_CONTEXT.md`.  
2. Align UI to Figma ([Product Template](https://www.figma.com/design/w9ZZXytE6QPLmN0DGpGUyn/Product-Template--Copy-?node-id=1-10&m=dev)).  
3. Build in small steps; test on iPad (Safari / Home Screen).  
4. **Document → commit → push → deploy** after each step.

## Cursor modes (quick reference)

| Mode | When to use |
|------|-------------|
| **Agent** | Build features, fix UI, update docs |
| **Ask** | Questions without changing files |
| **Plan** | Larger architecture / multi-screen redesigns |

## Files to keep updated

| File | When |
|------|------|
| `PROJECT_CONTEXT.md` | After every meaningful feature or decision |
| `README.md` | When name, URL, or setup steps change |
| `INSTRUCTIONS.md` | When workflow rules change |
| `docs/*` | When research / tokens / discovery change |

## Data reminder

Firings live in the **browser’s localStorage on the iPad**. Deploys do not wipe them. Clear Safari data / another device will. Use **Export CSV** / **Full backup** to keep a copy.

## If `npm run dev` fails on Windows

Use `npm.cmd run dev` or `dev.cmd`. See README for ExecutionPolicy fix.
