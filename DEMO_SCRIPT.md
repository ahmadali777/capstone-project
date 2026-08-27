# SpatialStager AI — Demo Video Script (3–5 minutes)

**Purpose of this recording:** A complete presentation — explain the project, its purpose, and the tech, then show the actual tool working live. No slides. Everything you see is the running application.

**Setup before recording:**
- App running at http://127.0.0.1:3000 in Chrome, maximised, 3D room visible
- Clean room state (fresh load so the starter layout shows)
- Microphone on, no background noise
- Total time target: ~4:30

---

## PART 1 — INTRO & PROJECT OVERVIEW (~0:00–1:00)

> "Hi, I'm Ahmad. This is my capstone project, **SpatialStager AI** — a browser-based 3D room staging tool. The idea is simple: instead of rearranging actual furniture or sketching layouts by hand, you build a room in your browser and experiment freely before committing to any design.

> **Who is it for?** Design students, freelance interior designers, and homeowners who want to prototype a room layout without installing heavyweight CAD software. It's a low-barrier way to answer the question 'what would this room look like if I moved the sofa here?'

> **Why build this?** A 3D staging tool lets you test placement, materials, lighting, and even get AI design advice — all without buying anything or measuring the real space. In this demo I'll walk through setting up a room, staging furniture, getting AI advice, and exporting the result. Where relevant, I'll be honest about limitations too."

---

## PART 2 — ROOM SETUP (~1:00–2:00)

**Action:** Open the tools panel (toggle button). Pick a room type — "Living Room". Change dimensions. Change wall colour. Change floor material. Change lighting mood.

> "The tools panel on the left drives the whole experience. I'll select 'Living Room' — this is a filter, it changes which furniture catalog is available and sets sensible starting dimensions. I'll set the room to 14 by 12 feet, then warm up the wall colour to a beige, switch the floor to wood, and set the lighting to 'cozy'.

> A note on the architecture: every change updates a client-side state store. There's no backend database — your design is saved automatically to localStorage, so if I refresh the page, the room comes right back. That local-first choice keeps the first version simple, private, and free to run without sign-in."

---

## PART 3 — FURNITURE STAGING (~2:00–3:00)

**Action:** Drag a sofa, a chair, and a table into the scene. Move them around. Push two items together to trigger the collision warning. Use undo. Rotate an item.

> "Now let's add furniture. I'll drag a sofa onto the floor, add an accent chair, and a coffee table. Each item comes from a procedural 3D model — no downloads needed, they're drawn in the browser.

> Watch this: when I push the table into the sofa, you'll see an orange highlight — that's the collision detector. I made a deliberate design decision here: it *warns* instead of blocking. In a staging tool, you sometimes want to overlap items on purpose while you experiment, so a soft warning is more useful than a hard restriction.

> And every move is reversible. I can undo, redo — the layout history lets you try an idea and back out without losing work. I can also rotate items to change their orientation relative to the room."

---

## PART 4 — AI CHAT (~3:00–3:45)

**Action:** Open the chat panel. Ask something like "How would you arrange a small cozy living room?" Send it. Watch the streamed response.

> "Here's the AI piece. The chat panel connects to an interior-design assistant that has context about the current room — its type, dimensions, and the furniture in it. I'll ask: 'How would I arrange a small cozy living room?'

> The response streams in as it's generated. Under the hood, the backend prefers one model provider and falls back to another if it's unavailable — a design choice that removes the risk of a single point of failure on the AI side. The advice it gives is specific, because it can see the room I built."

---

## PART 5 — PHOTO SUGGESTION + EXPORT (~3:45–4:30)

**Action:** Upload a room photo (or use the button). Show the suggestion returning. Then export a PNG and/or JSON.

> "There's also a photo feature: upload a picture of an existing room, and the tool returns a style suggestion — mood tags, a wall colour, a floor material, and furniture ideas you can apply to the scene.

> **One honest limitation I want to flag:** in this version, photo analysis is mocked — it returns a sample suggestion so the app works offline with no API key. The code has a real vision-model implementation ready, but I chose to keep the demo version mock so it runs without external costs. That's a v2 upgrade.

> To finish, I'll export this design as a PNG screenshot to share with a client, and as a JSON file that captures every object's position, rotation, and colour — so I can import it later and pick up where I left off."

---

## PART 6 — CLOSING (~4:30–4:40)

> "That's SpatialStager AI. It combines interactive 3D staging, local-first saving, collision feedback, and an AI design assistant — all in the browser. The full README covers setup, evaluation results, and a transparency note about what I built with AI versus what I verified myself. Thanks for watching."

---

## Recording checklist

- [ ] Chrome maximised, app loaded, 3D scene visible
- [ ] Fresh page load (starter layout visible for a clean open)
- [ ] Microphone on, no background noise
- [ ] No slides — live app only, all narration over the real tool
- [ ] Keep total time between 3:00 and 5:00
- [ ] Include the photo-analysis limitation on camera / narrated
- [ ] Explain at least one design decision (collision warning is the built-in example)

## Notes on what the current tool actually supports (keep the demo honest)

- Room types available in the catalog picker: **room**, **living-room**, **washroom**, **kitchen** (dropdown)
- Furniture is **filtered** by room type; all items render as procedural 3D geometry (only the sofa uses a loaded 3D model, with a built-in fallback if the model fails)
- Collision detection: floor furniture warns on overlap; rugs and wall items are excluded
- Wall items: doors, windows, vents (structural) plus painting, mirror, wall-shelf, clock, TV-mount (decorative) — placed on a selected wall
- AI chat: streams responses, rate-limited to 2 messages per session, needs a Groq/OpenRouter key
- Photo analysis: **mock** — returns a random suggestion, not a real image analysis
- Export: PNG screenshot and JSON import/export
- Accessibility: WebGL fallback to a static SVG preview; full keyboard and reduced-motion support
