import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: set this to '/your-repo-name/' when deploying to GitHub Pages
// Example: base: '/13-moon-calendar/'
export default defineConfig({
  plugins: [react()],
  base: '/13-moon-calendar/',
})
