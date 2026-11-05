import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Host-dependent base path:
  //   - Vercel serves from the domain root ('/'). Vercel sets VERCEL=1 during its build.
  //   - GitHub Pages serves from https://vestanra.github.io/nextrun/ (the '/nextrun/' subpath).
  base: process.env.VERCEL ? '/' : '/nextrun/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
