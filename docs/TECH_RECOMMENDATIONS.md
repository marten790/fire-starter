# Technology recommendations — iPad-first dashboard

## Recommendation: **Responsive web app + PWA** (not a native App Store app for v1)

For your use case — personal kiln log, iPad in the studio, designer-led first project — a **website that works like an app** is the best starting point.

### Why this fits you

| Factor | Web / PWA | Native iOS app |
|--------|-----------|----------------|
| First project / learning curve | Lower — one codebase, instant preview | Higher — Xcode, certificates, App Store |
| iPad use | Open in **Safari**, **Add to Home Screen** for full-screen icon | Install from App Store |
| Updates | Change and refresh; no review wait | App Store review each update |
| Offline in kiln room | Possible with PWA service worker | Possible |
| Bluetooth kiln probes | Not needed for v1 (manual meter) | Only needed if you add hardware later |
| Cost | Hosting can be free (Vercel, Netlify, GitHub Pages) | $99/year Apple Developer |

iPad Safari supports **Add to Home Screen**, standalone display, and (iOS 16.4+) web push — enough for a studio dashboard. See [PWA vs native comparisons](https://www.code24x7.com/blog/progressive-web-app-vs-native-app) and [when PWAs work well for internal tools](https://venturecrane.com/articles/pwa-vs-native-skip-app-store/).

### What you'll experience on iPad

1. We deploy the app to a URL (or run locally while developing)
2. You open it in **Safari**
3. **Share → Add to Home Screen** — it looks and opens like an app
4. Optional later: offline mode so logging works without Wi‑Fi

### When to reconsider native

- You want App Store distribution for other potters
- You add **Bluetooth** temperature probes
- You need **background alerts** while the iPad is locked for hours

We can wrap the same web UI in a thin native shell later without rewriting everything ([hybrid approach](https://code2native.com/blog/pwa-vs-native-app-2025)).

## Suggested stack (beginner-friendly, Figma-friendly)

| Piece | Suggestion | Why |
|-------|------------|-----|
| Framework | **React** (with Vite) | Huge community; easy to find help in Cursor |
| Styling | **Tailwind CSS** or CSS variables from Figma | Matches design tokens well |
| Data (MVP) | **Browser local storage** or **IndexedDB** | No server setup; works offline-ish |
| Data (later) | Supabase or Firebase | Sync across devices if you want |
| Hosting | **Vercel** or **Netlify** | Free tier; connect to GitHub repo |

**Figma → code:** We can use your design system's colors, typography, and spacing as CSS variables. Component-by-component is fine — we don't need a fancy Figma plugin on day one.

## iPad UX principles for this app

- **Minimum tap target ~44×44 pt** (Apple HIG)
- **High contrast** — kiln room lighting varies
- **One primary action per screen** during active firing
- **Large number entry** for temperature
- **Portrait and landscape** — stand or hold while logging
- **Avoid tiny tables** during a fire; use cards and big buttons

## Development workflow on your machine

1. Code lives in this repo (`fire-starter`)
2. Cursor **Agent** helps write and explain each step
3. Preview in browser on PC, then test same URL on iPad (same Wi‑Fi) or deployed link
4. Commit + push after each milestone (`INSTRUCTIONS.md`)

## Security & privacy

- Personal firing logs — no need for public accounts in v1
- If we add cloud sync later, we'll use simple sign-in (Apple or email)
- Your data stays yours; export anytime
