import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['components/**/*.{ts,tsx}', 'store/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
      // The interactive Three.js scene, its furniture renderer, and the toolbar
      // that orchestrates them require a WebGL context that jsdom cannot
      // provide, so they are excluded from the unit-coverage denominator.
      // They are exercised instead by the Playwright end-to-end test, which
      // drives a real browser through the critical user flow.
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/test/**',
        '**/node_modules/**',
        'components/Scene.tsx',
        'components/FurniturePiece.tsx',
        'components/SofaModel.tsx',
        'components/ToolsPanel.tsx',
        'components/ExportControls.tsx',
        'components/ui/dialog.tsx',
        'components/ui/tabs.tsx',
      ],
      thresholds: {
        functions: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
});
