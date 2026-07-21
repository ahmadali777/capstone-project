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
- 3D isometric room (orbit camera) built with React Three Fiber
- 6 furniture types (sofa, chair, table, lamp, plant, rug) — click a
  sidebar card to add one, click an object in the scene to select and
  drag it to reposition
- Photo upload → mock "AI style suggestion" card → apply to room
- Chat sidebar ("make it cozy" / "make it bright" / "make it dramatic")
  that updates wall color, floor material, and lighting live

## Run it locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Project structure
```
app/
  page.tsx              # main page: 3D canvas + sidebar
  layout.tsx
  api/analyze-room/     # photo -> style suggestion endpoint
  api/scene-chat/       # chat text -> scene preset endpoint
components/
  Scene.tsx             # room, lighting, camera
  FurniturePiece.tsx     # renders + lets you drag each object
  Sidebar.tsx            # asset library, upload, chat UI
store/
  useStore.ts            # Zustand store — shared state between UI and 3D
```

## Next steps to extend this
1. Add a real OpenAI/Claude API key in `.env.local` (`OPENAI_API_KEY=...`)
   and uncomment the "REAL VERSION" block in each API route.
2. Swap the primitive-shape furniture in `FurniturePiece.tsx` for real
   `.glb` models (e.g. from Poly Pizza) using `useGLTF` from
   `@react-three/drei`.
3. Add object rotation/delete controls, and a screenshot/export button.

## Deploy
Push to GitHub, then import the repo at vercel.com — no config needed,
Vercel auto-detects Next.js.
