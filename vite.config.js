import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext', // Enables Top-level await
  },
})
