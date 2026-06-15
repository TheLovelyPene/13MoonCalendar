import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: '/' for Netlify (serves from root)
// base: '/13-moon-calendar/' for GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/',
})
