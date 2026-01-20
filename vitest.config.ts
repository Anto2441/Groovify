import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json-summary'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
    },
    passWithNoTests: true,
  },
})
