# NOTES.md — Custom vs shadcn/ui (Radix) Accessibility Components

## Overview

I built three interactive widgets by hand in this folder (`playground/`):
- `ModalDialog.tsx` — WAI-ARIA Dialog (Modal) Pattern
- `Tabs.tsx` — WAI-ARIA Tabs Pattern
- `Disclosure.tsx` — WAI-ARIA Disclosure Pattern

Then I added shadcn/ui's `Dialog` and `Tabs` (which wrap `@radix-ui/react-dialog` and `@radix-ui/react-tabs`) to `components/ui/` and put both versions side-by-side at the `/playground` route. The demo page lives in Next.js's required location at `app/playground/page.tsx` and imports the three components above using `@/playground/*`.

Below are the concrete gaps I noticed after reading shadcn/ui's generated source and testing both implementations.

---

## Gap 1 — Portal + Document Render Layer

**Where I missed it:** Custom `ModalDialog.tsx` renders the dialog and overlay as plain siblings directly in the DOM tree of the calling component.

**What shadcn/Radix does:**
- `@radix-ui/react-dialog` ships a separate `DialogPortal` component (re-exported in `components/ui/dialog.tsx`) that uses React `createPortal()` to mount the overlay + content into `document.body`.
- This avoids CSS stacking-context bugs: if any ancestor element has `position: relative`, `overflow: hidden`, `transform`, or a non-auto `z-index`, my inline dialog would be clipped or hidden behind unrelated content. Radix always renders at the document root so stacking is predictable.
- The `DialogContent` component in shadcn is hardcoded to wrap `DialogOverlay` + content in a `DialogPortal`, so consumers never forget it.

**Why it matters in the real world:** A modal that breaks because it was rendered inside a sidebar with `overflow: hidden` is a classic, hard-to-debug accessibility failure. Users on keyboard or screen readers can see the overlay but the content is invisible.

---

## Gap 2 — Focus Trap Correctness (inert + iframe/contenteditable edge cases)

**Where I missed it:** My custom focus trap in `ModalDialog.tsx` uses a naive selector:
```
a[href], button:not([disabled]), input, select, textarea, iframe, [contenteditable], [tabindex]:not([tabindex="-1"])
```
and then manually shifts focus between the first and last matching element on Tab/Shift+Tab.

**What shadcn/Radix does:**
- Radix Dialog integrates a proper focus-trap library that also marks the entire rest of the page as `inert` (or emulates inert with aria-hidden on all siblings) so screen readers can't accidentally navigate out of the dialog with virtual-cursor controls, not just Tab.
- It handles elements inside **Shadow DOM**, which my `querySelectorAll` call cannot cross.
- It skips visually-hidden elements (`visibility: hidden`, `display: none`, zero-size, off-screen clipped via negative text-indent) which my simple selector would still try to focus, causing the focus to appear "stuck."
- It handles `role="document"` correctly, re-enabling escape from the trap if the user is inside an editable document region that needs its own Tab key.

**Why it matters in the real world:** Apple VoiceOver users can swipe right to move the VO cursor outside a naive focus-trap and interact with background content, completely breaking the "modal" contract. The WAI-ARIA APG Dialog pattern explicitly requires inert background content, not just Tab cycling.

---

## Gap 3 — Tabs: Activation Mode (automatic vs manual)

**Where I missed it:** My custom `Tabs.tsx` activates a tab immediately as arrow keys move focus to it ("automatic activation", the older WAI-ARIA recommendation). This is implemented in `onKeyDown`:
```
const nextValue = nextTab.dataset.value;
if (nextValue) handleChange(nextValue);
```

**What shadcn/Radix does:**
- `@radix-ui/react-tabs` supports a `activationMode` prop, defaulting to `"automatic"` but also allowing `"manual"`. In manual mode, arrow keys move focus only, and the user must press Enter or Space to actually switch the panel.
- Manual mode is the **current APG recommendation** for tabs where panels are expensive to render or contain lots of content (prevents extra work for keyboard users who are just quickly skimming tab labels to find the one they want).
- Radix also emits correct state attributes like `data-state="active"` / `data-state="inactive"` on both trigger and content elements, which shadcn uses to drive CSS transitions (e.g. `data-[state=active]:bg-background` in `tabs.tsx`) without any extra JS from the consumer.

**Why it matters:** If each tab panel does heavy work (fetching data, rendering a chart), automatic activation on every arrow-press causes unnecessary network requests and jank. The APG itself warns against automatic mode for heavy panels, so a reusable component needs both behaviors.

---

## Gap 4 — Tabs and Disclosure: Controlled vs Uncontrolled + Internal State Primitive

**Where I missed it:** My custom `Tabs` and `Disclosure` both hand-roll the same boilerplate:
```ts
const [internalValue, setInternalValue] = useState(defaultValue);
const value = controlledValue ?? internalValue;
function handleChange(next) {
  if (controlledValue === undefined) setInternalValue(next);
  onValueChange?.(next);
}
```

This looks correct but has subtle bugs:
- If `defaultValue` is provided and then the parent later switches to controlled mode (value prop goes from `undefined` → a string), the component's initial state can desync.
- No side effect runs when the controlled `value` prop changes from outside, so keyboard state can drift.

**What shadcn/Radix does:**
- Every Radix primitive is built on top of a shared `@radix-ui/react-presence` and internal state management primitive that guarantees:
  - Changing the `value` / `open` prop externally always wins, instantly.
  - `onValueChange` is never double-fired.
  - Component sub-parts (e.g. `DialogTrigger`, `DialogClose`, `DialogContent`) can be rendered in completely different sub-trees (across portals, in a separate component file) and still find each other via React context without prop drilling.
- In particular, the `asChild` pattern shadcn uses on every trigger/close/title slot lets you compose semantics onto your own `Button` component without re-wrapping, preserving the original `ref`, ARIA attributes, and event handlers. My custom ModalDialog forces a specific close-button shape.

---

## Gap 5 — Disclosure: Panel Open/Close Animations (Mount/Unmount + Height Measurement)

**Where I missed it:** My custom Disclosure toggles with `hidden={!open}`, which is an immediate show/hide. There's no animation possible because the panel is removed from the layout instantly.

**What shadcn/Radix (Accordion) does:**
- Radix Accordion (the disclosure-like primitive shadcn ships) measures the content height dynamically and exposes it as a CSS variable `--radix-accordion-content-height` during transitions.
- It separates "open state" from "mounted state" using `Presence`, so the panel stays in the DOM long enough for the exit animation to complete before being unmounted.
- The shadcn `tailwind.config.js` preset already includes keyframes for `accordion-down` / `accordion-up` that use this CSS variable:
  ```
  keyframes: {
    'accordion-down': {
      from: { height: '0' },
      to: { height: 'var(--radix-accordion-content-height)' },
    },
  }
  ```
- Measuring height correctly also handles the case where disclosure content *changes size while open* (content fetched from API after mount, font loads late, etc.). My static version would overflow.

---

## Summary: Two Non-Negotiable Gaps I Would Always Use Radix/shadcn For

1. **Portals + inert background for modals.** It's a few lines to add if you already have Radix; building it correctly from scratch requires Shadow DOM traversal, polyfill-safe inert management, and stacking-context awareness. Any app that renders modals inside sidebar/overlay containers will break without this.

2. **Composable `asChild` slots + context-connected sub-components.** My ModalDialog forces a specific title, description, close button, and footer shape. shadcn's pattern — `DialogTitle`, `DialogDescription`, `DialogClose` as standalone children that auto-wire their ARIA via context — means consumers can rearrange, add custom buttons, or nest forms freely *without* breaking `aria-labelledby` / `aria-describedby`. This composability is the real value of a primitive library, not just keyboard handling.
