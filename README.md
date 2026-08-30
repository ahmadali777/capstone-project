# SpatialStager AI

> AI-assisted 3D room staging for trying layouts, materials, and lighting before committing to a design.

https://capstone-project-three-silk-20.vercel.app

**Repository:** [github.com/ahmadali777/capstone-project](https://github.com/ahmadali777/capstone-project)

SpatialStager AI is a browser-based interior-design playground. Users select furniture and move it with arrow keys (or an on-screen D-pad on mobile), arrange floor pieces and wall-mounted items across all four editable walls, adjust materials and lighting, upload a room photo for a quick style suggestion, and ask an AI design assistant for tailored advice. Designs remain in the browser and can be exported as JSON or a PNG image.

Built for design students, freelance interior designers, and homeowners who want to prototype room layouts without installing heavyweight CAD software.

**Why this idea:** staging a room well is a spatial, iterative problem — layout, materials, and lighting interact, and most people try several arrangements before committing. A click-to-place 3D scene with keyboard movement and an AI advisor that can actually *change the scene* solves that better than a static before/after image, and it exercises the full stack this capstone cares about: accessible components, structured AI output, resilience to provider failures, and deliberate deployment.

## Screenshots

The desktop and mobile views below were captured from the local application. Keeping the source images in the repository lets the README render on GitHub and gives reviewers an immediate view of the product.

| 3D room designer | Responsive controls |
| --- | --- |
| ![SpatialStager AI 3D room designer](docs/screenshots/room-designer.png) | ![SpatialStager AI mobile controls](docs/screenshots/mobile-controls.png) |

## What it does

- Creates an interactive 3D room with orbit controls and a client-only Three.js canvas.
- Selects items by clicking, then moves them with arrow keys (or the on-screen D-pad on mobile): floor items move left/right/forward/back, wall items move along the wall and up/down. Only one item or wall is selected at a time.
- Shows all four walls in the same color (back, left, right, and a translucent front view wall). Click a wall to select it; wall items are placed on the currently selected wall.
- Adds floor furniture (sofa, chair, table, lamp, plant, rug, bookshelf, TV stand, cabinet, bed, desk) and wall items — doors, windows, vents, paintings, mirrors, shelves, clocks, and TV mounts — that snap to the selected wall.
- Places items freely: no overlap blocking or collision warnings, and arrow-key movement always works, so layouts can be arranged by eye. Room walls still act as a boundary.
- Rotates items to suit their placement: floor items spin 90° on the floor, wall items flip between vertical and horizontal orientation.
- Deletes the selected item from the bottom toolbar or the `Delete`/`Backspace` key.
- Supports undo/redo for layout changes (`Ctrl+Z` / `Ctrl+Y`).
- Adjusts wall color, floor finish, lighting, room dimensions, and furniture color/finish.
- Saves the current design to `localStorage`, exports/imports layout JSON, and downloads a PNG screenshot of the canvas.
- Accepts a room photo and returns a demo style suggestion that can be applied to the scene.
- Streams AI-powered interior-design advice through the chat panel when a Groq or OpenRouter key is configured.
- Falls back to a static SVG room preview for WebGL-unavailable, low-power, or reduced-motion environments.

## Usage examples

**Stage a living room layout:** Select "Living Room" from the room type picker, set dimensions to 14 × 12 ft, and add a sofa and two chairs. Use the arrow keys to place them wherever you like — items can sit right next to each other with nothing blocking the move. Rotate the sofa to face the back wall and change the wall color to warm beige. Select a wall to add doors, windows, or decorative pieces on that wall. Press undo if a placement does not feel right. Export the final layout as JSON to revisit later, or download a PNG screenshot to share with a client.

**Ask the AI assistant for design advice:** Open the chat panel and ask something like "How should I arrange furniture in a 10 × 10 ft bedroom?" The assistant streams a response referencing the current room type, dimensions, and existing furniture. Apply the suggested lighting mood directly from the response.

**Get a quick style suggestion from a photo:** Upload a photo of an existing room. The tool analyses it and returns mood tags, a wall colour, a floor material, and a furniture list. Click "Apply" to push those suggestions into the 3D scene and see the room update instantly.

## Tech stack

| Area | Tools |
| --- | --- |
| App framework | Next.js 14 (App Router), React 18, TypeScript |
| 3D scene | Three.js, React Three Fiber, React Three Drei |
| Styling and UI | Tailwind CSS, Radix UI, Lucide |
| State | Zustand with Zundo history |
| AI chat | Groq SDK or OpenRouter, Vercel AI SDK streaming primitives |
| Validation and forms | Zod, React Hook Form |
| Testing | Vitest, Testing Library, Playwright |
| Deployment target | Vercel |

## Run locally

### Prerequisites

- Node.js 18.17 or newer (Node 20 LTS recommended)
- npm
- An optional Groq or OpenRouter API key for live chat

### Setup

```bash
git clone https://github.com/ahmadali777/capstone-project.git
cd capstone-project
npm install
```

Create `.env.local` in the project root. Configure at least one chat provider if you want live responses:

```env
GROQ_API_KEY=your_groq_key
# Or use OpenRouter:
# OPENROUTER_API_KEY=your_openrouter_key
```

Start the app:

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The room designer and mock photo-analysis flow work without an API key; the chat panel explains how to configure a key when neither provider is available.

### Useful commands

```bash
npm run dev          # local development server
npm run build        # production build check
npm run start        # serve a completed production build
npm test             # unit/component tests
npm run test:coverage# unit tests + v8 coverage report
npm run test:e2e     # Playwright browser tests
```

## Environment variables

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | No* | `/api/scene-chat` | Preferred provider for streamed design chat (`openai/gpt-oss-120b`). |
| `OPENROUTER_API_KEY` | No* | `/api/scene-chat` | Alternative provider for streamed design chat (`openai/gpt-4o-mini`). |
| `GEMINI_API_KEY` | No* | `/api/scene-chat` | Backward-compatible fallback alias for the OpenRouter key. |
| `OPENAI_API_KEY` | No | commented example in `/api/analyze-room` | Only needed if the mock photo-analysis implementation is intentionally replaced with the documented OpenAI example. |

\* Configure either `GROQ_API_KEY` or `OPENROUTER_API_KEY` for live AI chat. Never prefix these variables with `NEXT_PUBLIC_`, commit `.env.local`, or expose API keys in the browser.

## Architecture

```text
Browser
├── app/page.tsx
│   ├── ToolsPanel: room, material, object, import/export controls
│   ├── Scene: lazy-loaded React Three Fiber room and furniture
│   └── ChatPanel: streamed conversation UI
├── Zustand store
│   ├── scene state, item placement and movement, undo/redo
│   └── localStorage autosave/restore
└── Next.js route handlers
    ├── POST /api/analyze-room → deterministic demo style suggestion
    └── POST /api/scene-chat → Groq or OpenRouter → streamed response
```

The 3D scene is dynamically imported with server-side rendering disabled because WebGL requires the browser. Scene state is intentionally client-local: there are no accounts, databases, or server-side saved designs in this version. API keys are read only in the server route handler, so the browser never receives them.

## V3 evaluation results

### Automated tests

| Suite | Framework | Tests | Status |
| --- | --- | --- | --- |
| Unit / component | Vitest + Testing Library (jsdom) | 96 | All passing |
| End-to-end | Playwright (Chromium) | 1 | Passing |
| Unit coverage (testable core) | Vitest v8 | 74.9% stmts / 71.2% funcs / 77.8% lines | Above the 50% bar |

Full test output, the coverage report, and a note on why the WebGL scene
renderer is covered by E2E instead of unit tests: [`docs/testing-evidence.md`](docs/testing-evidence.md).

Unit tests cover the chat panel (message sending, streaming, stop, error banners, rate limiting, offline state), message bubbles (text, reasoning, tool cards, file links), tool cards (structured output, failure, busy, streaming states), the settings form (validation, save, reset, disabled state), the AI prompt builder, the scene-mood analysis tool, the markdown stripper, the chat rate limiter, and the scene store — adding, moving, rotating, and deleting floor and wall items across all four walls (back, left, right, front), boundary clamping, wall-placement on the selected wall, and export/import round-trips. The scene store places furniture with `Math.random()`, so the suite stubs that value deterministically to keep movement assertions from being flaky.

### Accessibility and performance audit

Tested with WAVE and Lighthouse on 17 August 2026 ([docs/audit.md](docs/audit.md)).

| Metric | Score |
| --- | --- |
| WAVE accessibility | 10 / 10 |
| Lighthouse accessibility | 100 |
| Lighthouse best practices | 100 |
| Lighthouse performance | 80 |
| Lighthouse SEO | 60 → full Open Graph/Twitter/robots/canonical metadata added 30 Aug 2026 (re-audit pending next deploy) |

Zero WAVE errors, zero contrast errors, zero alerts. The main area for improvement had been SEO (score 60), expected for a client-rendered SPA without server-side meta tag generation — the root layout now generates complete SEO + social metadata, a dedicated Open Graph image, and a canonical URL to close that gap.

## Limitations

- **Mock photo analysis (v1):** The `/api/analyze-room` route returns a random style suggestion from a fixed set. A real OpenAI GPT-4o Vision implementation exists as a commented-out reference but is not active.
- **Two-message chat rate limit:** The client-side rate limiter allows only 2 messages per session (resets on page refresh). This is intentionally restrictive to keep demo costs near zero.
- **No server-side persistence:** All design state lives in `localStorage`. There are no user accounts, databases, or cloud-saved designs.
- **Single-turn AI chat:** Only the latest user message is sent to the provider; there is no conversation history. Room context is re-attached to every request.
- **Simple 3D geometry:** Only the sofa uses a GLB model (with a procedural fallback). All other furniture items are basic Three.js primitives (boxes, cylinders, spheres).
- **Client-rendered SPA & SEO:** as a client-rendered app the page still leans on client JavaScript, which constrains raw Lighthouse performance; SEO was historically 60 and is now addressed with full Open Graph/Twitter/robots/canonical metadata (re-audit pending next deploy).
- **Button `disabled` accessibility gap:** The send button uses the native `disabled` attribute, which removes it from the tab order. The WAI-ARIA APG recommends `aria-disabled` plus a guarded no-op for controls that should remain keyboard-discoverable.

## Product and engineering decisions

- **Interactive 3D instead of generated images:** staging objects in a scene lets users experiment with placement, collisions, materials, and lighting rather than receiving a single static output.
- **Progressive enhancement for rendering:** the application preserves the core room experience with an SVG fallback when WebGL or motion-heavy rendering is unsuitable.
- **Local-first saving:** `localStorage` and JSON import/export keep the first version simple, private, and usable without sign-in or backend infrastructure.
- **Free placement instead of collision rules:** overlap checks were removed so users can arrange items by eye; the room walls still act as a boundary, so nothing can be moved outside the room.
- **Keyboard-first interaction:** selecting with a click and moving with arrow keys (plus an on-screen D-pad on mobile) gives precise, predictable control and works for floor and wall items alike.
- **Provider fallback for chat:** the route prefers Groq when available and otherwise uses OpenRouter, reducing coupling to one AI service.
- **Mock image analysis in v1:** photo analysis returns sample style suggestions, allowing a complete demo without requiring image-model credits. The route contains a documented OpenAI implementation path for a future live version.

## Production deployment, checklist & operations

Deploy by importing the GitHub repository into Vercel. Add `GROQ_API_KEY` or
`OPENROUTER_API_KEY` in **Project Settings → Environment Variables** for
Production, Preview, and Development as appropriate, then redeploy. A custom
domain can be connected from Vercel's Domains settings.

The deployment checklist is completed and **signed off** in
[`docs/DEPLOYMENT_CHECKLIST.md`](docs/DEPLOYMENT_CHECKLIST.md). Summary of what is
done vs. outstanding:

- **Done:** production build, secrets in Vercel (never reach the browser, `.env.local` git-ignored), CI on every push/PR (lint + 96 unit tests + E2E), WAVE 10/10 + Lighthouse a11y 100, provider-failure fallbacks, missing-key graceful degradation, WebGL SVG fallback, input validation, client-side chat rate limit, `maxDuration` on the streaming route, rollback path documented.
- **Deferred / watch:** IP-based server-side rate limiting (client-only cap ships today), uptime monitoring (recovery = "redeploy from main"), and a Lighthouse re-audit for the SEO/performance gains from the 30 Aug 2026 metadata.

**How it fails safely:** if the chat provider is down or out of credits the route
catches the error, logs it, and streams a readable message; if no API key is set
it explains how to configure one; if WebGL or motion-heavy rendering is
unavailable the static SVG `SceneFallback` keeps the room experience usable; and
the request handler caps body size, message count, and prompt length before
touching the provider.

**Rollback & monitoring:** the app is stateless server-side (all design state
lives in `localStorage`, no database), so a rollback is a pure code deployment —
select the last good deployment in the Vercel dashboard and choose *Redeploy*,
or re-push the previous `main` commit. API-route errors are logged to Vercel
function logs for diagnosis.

## Reflection

**What was hardest?** Making the AI feel intentional rather than tacked-on. It
would have been easy to ship a chatbot that echoes the room back, but the 
product only earns its "AI" label if it *changes the scene*. The real work was
building the room-aware context — feeding the current room type, dimensions,
materials, and placed furniture into the system prompt on every request, plus a
structured "mood analysis" tool whose output can actually be applied to the 3D
scene. The second-hardest part was the rendering boundary: the Three.js scene
cannot run in jsdom, so unit-testing "the app" as a whole is impossible. That
forced me to be explicit about what a unit test can prove (state and logic)
versus what only a browser test can prove (rendering), which reshaped how I
scoped coverage.

**What would I do differently next time?** I would have introduced determinism
sooner. Floor furniture is placed with `Math.random()`, and during final testing
this surfaced an intermittent unit-test failure — a sofa that spawned exactly on
the room boundary meant a one-step "move right" clamped back to the same x, so an
assertion failed only sometimes. Stubbing `Math.random()` fixed it, but the bug
was a symptom of not designing for testability from the start. I'd also add real
conversation history and IP-level server rate limiting rather than relying on a
client-side cap and single-turn prompts.

**One thing that surprised me.** How much of "production readiness" is about
proving the *negative space*: documenting how it fails safely, how to roll back,
and which tests are *not* meaningful — not just listing what works. The
deployment checklist turned out to be more valuable than any single feature,
because it made explicit the trade-offs I had been making implicitly all term
(no database, localStorage-only, single-turn AI, client-side rate limit). Writing
it down is what turned "I shipped an app" into "I shipped an app I understand how
to operate."

## How AI tools contributed

This project was built with Claude (Anthropic) as a development collaborator. Here is what AI handled and what I verified myself.

**What AI helped with:**
- Scaffolding the Next.js project structure, route handlers, and component hierarchy
- Drafting React Three Fiber scene setup, item selection/movement logic, and Zustand state transitions
- Writing the Vercel AI SDK streaming integration for the chat panel
- Generating the initial test suite (Vitest + Playwright), which I then expanded and corrected
- Suggesting accessibility improvements (ARIA roles, live regions, keyboard behaviour)

**What I checked and decided myself:**
- All final implementation choices: local-first design, collision behaviour, WebGL fallback, provider fallback order, and rate-limit values
- Test coverage gaps: I added tests for edge cases AI missed (offline state, rate-limit exhaustion, stop-button stream interruption) and finalised a deterministic `Math.random()` stub so the scene-store movement suite is no longer flaky
- The accessibility audit (WAVE + Lighthouse), manual keyboard navigation testing, and the Lighthouse SEO metadata improvements
- The production deployment checklist, rollback plan, testing-evidence report, and this transparency statement and reflection

AI output was treated as a starting point. Every AI-generated line was reviewed, tested, and modified before shipping.

Built by:
Muhammad Ahmad Ali
https://ahmad-swe-portfolio.vercel.app

## License

This project is licensed under the [MIT License](LICENSE).
