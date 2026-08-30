# Deployment Checklist — SpatialStager AI

**Product:** SpatialStager AI — AI-assisted 3D room staging
**Platform:** Vercel (Next.js 14 App Router)
**Production URL:** https://capstone-project-three-silk-20.vercel.app
**Repository:** https://github.com/ahmadali777/capstone-project

Every capstone deployment should answer four questions before going live: *Is it secure? Can it be rolled back? Do I know how it fails? Do I know how to run it?* This checklist records the state of each one at the point of release, when it was last verified, and who signed it off.

---

## 1. Build & environment

| # | Check | Status | Notes |
| --- | --- | --- | --- |
| 1.1 | Production build succeeds locally (`npm run build`) | ✅ Pass | Verified `next build` completes with all routes static. |
| 1.2 | Environment variables for Production are set in Vercel | ✅ Pass | `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY` configured for Production / Preview / Development. |
| 1.3 | No `NEXT_PUBLIC_` keys; secrets never reach the browser | ✅ Pass | Keys are read only in the server route handlers (`app/api/*`); they are not bundled into client code. See `lib/`. |
| 1.4 | `.env.local` / `.env.*` excluded from the repository | ✅ Pass | Listed in `.gitignore`; not present in Git history. |
| 1.5 | `node_modules`, `.next`, `test-results`, `coverage` are ignored | ✅ Pass | All build and test artifacts ignored via `.gitignore`. |
| 1.6 | Dependency lockfile (`package-lock.json`) committed | ✅ Pass | `npm ci` reproduces a deterministic install in CI. |

## 2. Quality gates (CI)

| # | Check | Status | Notes |
| --- | --- | --- | --- |
| 2.1 | Lint passes | ✅ Pass | `npm run lint` green on `main` via GitHub Actions. |
| 2.2 | Unit tests pass | ✅ Pass | Vitest + Testing Library, 96 tests across 11 files, all green. |
| 2.3 | Unit coverage ≥ 50% of components | ✅ Pass | 74.9% statements, 71.2% functions, 77.8% lines over the unit-testable core (scene rendering covered by E2E). |
| 2.4 | End-to-end critical flow passes | ✅ Pass | Playwright drives a real browser through the chat flow on `main`. |
| 2.5 | CI runs on every push to `main` and on PRs | ✅ Pass | `.github/workflows/ci.yml`. |

## 3. Accessibility & performance

| # | Check | Status | Notes |
| --- | --- | --- | --- |
| 3.1 | WAVE audit clean (0 errors, 0 contrast errors, 0 alerts) | ✅ Pass | See `docs/audit.md` — AIM score 10/10. |
| 3.2 | Lighthouse accessibility ≥ 90 | ✅ Pass | 100. |
| 3.3 | Lighthouse best practices ≥ 90 | ✅ Pass | 100. |
| 3.4 | Lighthouse performance ≥ 85 | ⚠️ Watch | Reported 80 on 17 Aug 2026; primary gap is the client-rendered 3D scene. Not a release blocker — see `Known limitations`. |
| 3.5 | Lighthouse SEO ≥ 85 | ⚠️ Watch | Reported 60 due to the SPA being client-rendered; full Open Graph / Twitter / robots / canonical metadata added 30 Aug 2026 and is pending a re-audit after the next deploy. |
| 3.6 | Keyboard-only navigation and screen-reader spot-check | ✅ Pass | Manually verified; controls remain discoverable and live regions announce chat state changes. |

## 4. Resilience & error handling

| # | Check | Status | Notes |
| --- | --- | --- | --- |
| 4.1 | Chat provider failures surface a readable error | ✅ Pass | Route catches provider errors, logs them, streams a friendly fallback message (quota vs. auth distinguished). |
| 4.2 | Missing API key degrades gracefully | ✅ Pass | Route streams a "no key configured" message instead of crashing. |
| 4.3 | WebGL unavailable / reduced motion falls back | ✅ Pass | `SceneFallback` renders a static SVG room preview. |
| 4.4 | Input validation on chat and settings | ✅ Pass | Prompt length/whitelist caps server-side (`MAX_PROMPT_LENGTH`), Zod schema on the settings form. |
| 4.5 | Client-side rate limit on chat | ✅ Pass | 2-message cap per session (`lib/chatRateLimit.ts`) to keep demo costs near zero. |
| 4.6 | Server-side rate limiting (IP-based) | ⚠️ Not yet | Planned via Vercel KV / Upstash; client-only rate limit ships today. Documented as a known limitation. |

## 5. Monitoring, rollback & operation

| # | Check | Status | Notes |
| --- | --- | --- | --- |
| 5.1 | Dashboard URL identified | ✅ Pass | Vercel project dashboard + deployment logs. |
| 5.2 | Rollback path documented | ✅ Pass | Re-deploy any previous commit from the Vercel dashboard ("Redeploy" on a prior deployment), or `git checkout <sha> && push` to trigger CI → deploy. No DB migrations, so rollback is a straight code swap. |
| 5.3 | Logs captured for the API routes | ✅ Pass | `console.error` in `app/api/*` route handlers appears in Vercel function logs. |
| 5.4 | Health check / uptime monitoring | ⚠️ Not yet | No uptime monitor configured. For a portfolio deploy, "just redeploy from main" is the agreed recovery procedure. |
| 5.5 | Browser testing on Chrome / Firefox / Safari / mobile | ✅ Pass | Verified across Chromium (E2E) and manual Safari/mobile passes. |

---

## Sign-off

Deployment checklist reviewed and signed off on **30 August 2026**.

| Role | Name | Signature / Date |
| --- | --- | --- |
| Author & maintainer | Muhammad Ahmad Ali | ✅ Signed 30 Aug 2026 |

**Rollback procedure (agreed):** Because the app is stateless server-side (all design state lives in `localStorage` and no DB is used), rolling back is a pure code deployment: select the last known-good deployment in the Vercel dashboard and choose **Redeploy**. If a build breaks, CI fails before the deployment is promoted, and `main` is protected so a broken push cannot be promoted silently.
