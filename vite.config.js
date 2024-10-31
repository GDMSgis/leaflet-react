import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    extensions: ['.js', '.jsx'], // Allow Vite to recognize `.jsx` syntax in `.js` files
  },
  plugins: [react()],
})
