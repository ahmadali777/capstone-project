# SpatialStager AI

> AI-assisted 3D room staging for trying layouts, materials, and lighting before committing to a design.

https://capstone-project-three-silk-20.vercel.app

**Repository:** [github.com/ahmadali777/capstone-project](https://github.com/ahmadali777/capstone-project)

SpatialStager AI is a browser-based interior-design playground. Users select furniture and move it with arrow keys (or an on-screen D-pad on mobile), arrange floor pieces and wall-mounted items across all four editable walls, adjust materials and lighting, upload a room photo for a quick style suggestion, and ask an AI design assistant for tailored advice. Designs remain in the browser and can be exported as JSON or a PNG image.

Built for design students, freelance interior designers, and homeowners who want to prototype room layouts without installing heavyweight CAD software.

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
npm run dev        # local development server
npm run build      # production build check
npm run start      # serve a completed production build
npm test           # unit/component tests
npm run test:e2e   # Playwright browser tests
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

## V2 evaluation results

### Automated tests

| Suite | Framework | Tests | Status |
| --- | --- | --- | --- |
| Unit / component | Vitest + Testing Library | 74 | All passing |
| End-to-end | Playwright (Chromium) | 1 | Passing |

Unit tests cover the chat panel (message sending, streaming, stop, error banners, rate limiting, offline state), message bubbles (text, reasoning, tool cards, file links), tool cards (structured output, failure, busy, streaming states), the settings form (validation, save, reset, disabled state), and the scene store — adding, moving, rotating, and deleting floor and wall items across all four walls (back, left, right, front), boundary clamping, wall-placement on the selected wall, and export/import round-trips.

### Accessibility and performance audit

Tested with WAVE and Lighthouse on 17 August 2026.

| Metric | Score |
| --- | --- |
| WAVE accessibility | 10 / 10 |
| Lighthouse accessibility | 100 |
| Lighthouse best practices | 100 |
| Lighthouse performance | 80 |
| Lighthouse SEO | 60 |

Zero WAVE errors, zero contrast errors, zero alerts. The main area for improvement is SEO (score 60), which is expected for a client-rendered SPA without server-side meta tag generation.

## Limitations

- **Mock photo analysis (v1):** The `/api/analyze-room` route returns a random style suggestion from a fixed set. A real OpenAI GPT-4o Vision implementation exists as a commented-out reference but is not active.
- **Two-message chat rate limit:** The client-side rate limiter allows only 2 messages per session (resets on page refresh). This is intentionally restrictive to keep demo costs near zero.
- **No server-side persistence:** All design state lives in `localStorage`. There are no user accounts, databases, or cloud-saved designs.
- **Single-turn AI chat:** Only the latest user message is sent to the provider; there is no conversation history. Room context is re-attached to every request.
- **Simple 3D geometry:** Only the sofa uses a GLB model (with a procedural fallback). All other furniture items are basic Three.js primitives (boxes, cylinders, spheres).
- **Low SEO score:** Lighthouse SEO scored 60 because the app is a client-rendered SPA without server-side meta tag generation.
- **Button `disabled` accessibility gap:** The send button uses the native `disabled` attribute, which removes it from the tab order. The WAI-ARIA APG recommends `aria-disabled` plus a guarded no-op for controls that should remain keyboard-discoverable.

## Product and engineering decisions

- **Interactive 3D instead of generated images:** staging objects in a scene lets users experiment with placement, collisions, materials, and lighting rather than receiving a single static output.
- **Progressive enhancement for rendering:** the application preserves the core room experience with an SVG fallback when WebGL or motion-heavy rendering is unsuitable.
- **Local-first saving:** `localStorage` and JSON import/export keep the first version simple, private, and usable without sign-in or backend infrastructure.
- **Free placement instead of collision rules:** overlap checks were removed so users can arrange items by eye; the room walls still act as a boundary, so nothing can be moved outside the room.
- **Keyboard-first interaction:** selecting with a click and moving with arrow keys (plus an on-screen D-pad on mobile) gives precise, predictable control and works for floor and wall items alike.
- **Provider fallback for chat:** the route prefers Groq when available and otherwise uses OpenRouter, reducing coupling to one AI service.
- **Mock image analysis in v1:** photo analysis returns sample style suggestions, allowing a complete demo without requiring image-model credits. The route contains a documented OpenAI implementation path for a future live version.

## Production deployment and API safety

Deploy by importing the GitHub repository into Vercel. Add `GROQ_API_KEY` or `OPENROUTER_API_KEY` in **Project Settings → Environment Variables** for Production, Preview, and Development as appropriate, then redeploy. A custom domain can be connected from Vercel’s Domains settings.

Before publishing publicly, complete this production checklist:

- [ ] Add the Vercel production URL at the top of this README.
- [ ] Set the required provider key in Vercel; confirm no keys appear in client-side bundles or Git history.
- [ ] Add an IP-based rate limit to `/api/scene-chat` (for example, with Vercel KV/Upstash) and return `429` with a `Retry-After` header when exceeded.
- [ ] Cap request size, number of messages, and message length before calling the provider.
- [ ] Set a sensible `maxDuration` on the streaming route for the chosen Vercel plan.
- [ ] Test the full flow in Chrome, Firefox, Safari, and mobile Safari.

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
- Test coverage gaps: I added tests for edge cases AI missed (offline state, rate-limit exhaustion, stop-button stream interruption)
- The accessibility audit (WAVE + Lighthouse) and manual keyboard navigation testing
- Documentation language, architecture decisions, and this transparency statement

AI output was treated as a starting point. Every AI-generated line was reviewed, tested, and modified before shipping.

Built by:
Muhammad Ahmad Ali
https://ahmad-swe-portfolio.vercel.app

## License

This project is licensed under the [MIT License](LICENSE).
