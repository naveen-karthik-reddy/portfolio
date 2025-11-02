import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  // Update this to match your GitHub repository name
  // If repo is named 'portfolio', use '/portfolio'
  // If repo is named 'naveen-portfolio', use '/naveen-portfolio'
  // If deploying to username.github.io (root), use '/'
  base: '/portfolio',
})
