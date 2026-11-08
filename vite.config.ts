import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// `npm run dev` opens the site in Chrome. Set BROWSER=none to skip, or another app name to override.
process.env.BROWSER ??= 'Google Chrome'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
})
