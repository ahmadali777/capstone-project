# SpatialStager AI

Capstone project — FlyRank AI Frontend Internship.

An interactive 3D room-staging app: drop furniture into a 3D room, upload a
photo for an AI style suggestion, and chat to change the mood/lighting —
instead of just regenerating a flat AI image.

## Status: v1 (working, mock AI)

Everything runs and works out of the box with **no API key required** —
the two AI endpoints (`/api/analyze-room`, `/api/scene-chat`) currently
return smart mock responses so you can demo the full flow immediately.
Each route file has a commented-out "REAL VERSION" block showing exactly
how to swap in a live OpenAI/Claude call once you have a key.

## Features in this version
- 3D room designer (orbit camera) built with React Three Fiber, with a styled starter layout so the scene is never empty
- 6 floor furniture types (sofa, chair, table, lamp, plant, rug) plus wall-mounted doors, windows and vents — click a sidebar card to add one, click an object in the scene to select it, and drag to reposition (floor items move across the room, wall items slide along their wall)
- Collision awareness: overlapping floor items glow red and raise a warning banner — you're warned, never blocked (rugs are exempt, since furniture sitting on a rug is normal)
- Undo/redo for furniture layout via zundo, scoped so paint, lighting, room-size and settings changes never enter the undo history
- Wall placement controls: snap each wall item to the back or left wall from the "Which wall" toggle, and drag it along the wall to position it; selected wall items get a light-blue highlight instead of a floor ring
- Local-only persistence — no accounts, no backend: the Project panel stores the design in localStorage (autosaved ~1s after changes), downloads a PNG screenshot of the 3D canvas, and exports/imports the design as a `.json` file
- Photo upload → mock "AI style suggestion" card → apply to room
- Chat sidebar ("make it cozy" / "make it bright" / "make it dramatic")
  that updates wall color, floor material, and lighting live
- Tool-enabled AI chat with a structured mood-analysis tool that renders
  four tool states and a real score card component
- Material configurator: paint walls, swap floor finishes, change lighting, recolour furniture, change finish, rotate, and drag objects
- Performance-minded delivery: the Three.js canvas is client-only/lazy-loaded, adapts DPR/shadows on capable devices, and uses a static SVG room preview for WebGL, low-power, or reduced-motion contexts. The bundled sofa GLB is ~206 KB.

## Tool contract
- Tool name: `sceneMoodAnalysis`
- Input schema: `{ prompt: string, roomContext?: string }`
- Return shape: `{ score: number, label: string, summary: string, recommendations: string[], sceneUpdate: { lightingMood?: 'cozy' | 'bright' | 'dramatic' | 'neutral', wallColor?: string, floorMaterial?: 'wood' | 'tile' | 'carpet' } }`

## Run it locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Project structure
```
app/
  page.tsx              # main page: 3D canvas + sidebar + autosave
  layout.tsx
  api/analyze-room/     # photo -> style suggestion endpoint
  api/scene-chat/       # chat text -> scene preset endpoint
components/
  Scene.tsx             # room, lighting, camera (exposes canvas for export)
  FurniturePiece.tsx     # renders + drags each object (floor + wall items)
  SofaModel.tsx          # GLB sofa with a procedural fallback
  ToolsPanel.tsx         # sidebar: project, space, paint, furniture, wall items
  ExportControls.tsx     # project name, screenshot + design download/load
  SceneFallback.tsx      # static SVG preview when WebGL is unavailable
store/
  useStore.ts            # Zustand store (+ zundo undo/redo, collisions, persistence)
```

## Next steps to extend this
1. Add a real OpenAI/Claude API key in `.env.local` (`OPENAI_API_KEY=...`)
   and uncomment the "REAL VERSION" block in each API route.
2. Swap the primitive-shape furniture in `FurniturePiece.tsx` for real
   `.glb` models (e.g. from Poly Pizza) using `useGLTF` from
   `@react-three/drei`.
3. Add more wall sides (right/front), ceiling and window light sources,
   and shareable layout URLs or cloud sync on top of the existing
   export/import files.

## FE-10 performance note

The interactive scene keeps geometry intentionally small: one ~206 KB GLB sofa and procedural primitives for the rest. The canvas loads only in the browser; devices reporting low CPU capacity or reduced motion get the static fallback instead. On capable devices the DPR is capped at 1.75 and shadows use a 1024px map to protect frame time. Collision checks are a simple O(n²) distance pass (fine for a roomful of furniture), and `preserveDrawingBuffer` is enabled so the PNG screenshot export works. With more time, I would add meshopt compression to the GLB and shareable saved layouts.

## Deploy
Push to GitHub, then import the repo at vercel.com — no config needed,
Vercel auto-detects Next.js.
