import { defineConfig } from 'vite'

export default defineConfig({
  base: '/nanotracker2/',
  build: {
    target: 'esnext', // Enables Top-level await
  },
  server: {
    port: 3000,
  },
})
