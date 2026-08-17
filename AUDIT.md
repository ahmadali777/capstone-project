## Lighthouse Performance & Accessibility Audit

### Baseline Summary
* **Accessibility:** 100 / 100
* **Best Practices:** 100 / 100
* **SEO:** 100 / 100
* **Performance:** 77 / 100 (TBT: 1,120 ms, FCP: 0.9s, LCP: 1.4s, CLS: 0)

### Key Findings & Optimization Strategy
* **Issue:** High Total Blocking Time (1,120 ms) resulting from 5.2s of main-thread execution and 13 long tasks during initial load.
* **Remediation:**
  1. Dynamically imported heavy WebGL/Three.js components (`next/dynamic` with `ssr: false`).
  2. Deferred client-side initialization logic via `requestIdleCallback`.
  3. Reduced unused initial JS bundle size by splitting 3D rendering and chat components.

### Changes Made

#### 1. Lazy-Load ChatPanel (`app/page.tsx`)
* **Before:** `ChatPanel` was statically imported, bundling `@ai-sdk/react`, `ai` SDK, and all chat sub-components (`ToolCard`, `ChatErrorBanner`) into the initial JS regardless of whether the chat panel was open.
* **After:** `ChatPanel` is loaded via `next/dynamic` with `ssr: false` and a skeleton loading placeholder. The `@ai-sdk/react` + `ai` bundle is now only fetched when the user clicks the chat toggle button.

#### 2. Defer localStorage Restore (`app/page.tsx`)
* **Before:** `restoreDesignLocally()` ran synchronously inside `useEffect` on mount, parsing localStorage and hydrating the Zustand store on the main thread during initial render.
* **After:** Wrapped in `requestIdleCallback` (with a 2-second timeout fallback) so the restore runs during idle time after the first paint, reducing main-thread contention.

#### 3. Optimize Package Imports (`next.config.js`)
* **Before:** `lucide-react` imported all icons as a barrel module, adding unused icon code to the bundle.
* **After:** Enabled `experimental.optimizePackageImports: ['lucide-react']` so Next.js tree-shakes unused icon exports at build time, reducing the initial JS payload.
