import { defineConfig } from 'vitest/config'
// @ts-ignore - Package is properly installed, LSP moduleResolution warning can be safely ignored
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
