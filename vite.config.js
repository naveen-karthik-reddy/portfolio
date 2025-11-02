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
  // Base path for assets
  // Use '/' for root domain deployment (e.g., naveenkarthik.com)
  // Use '/portfolio' for subdirectory deployment (e.g., github.com/username/portfolio)
  base: '/',
})
