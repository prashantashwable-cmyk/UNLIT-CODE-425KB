import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Design tokens, strings and stage data are read from ../docs (single source of truth, not copied).
export default defineConfig({
  plugins: [react()],
  server: { fs: { allow: ['..'] } },
  test: { environment: 'jsdom', globals: true, setupFiles: ['src/setupTests.ts'] },
});
