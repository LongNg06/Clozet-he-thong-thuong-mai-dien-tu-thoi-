import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/img': 'http://localhost:5000',
      '/danhmuc_img': 'http://localhost:5000',
    },
  },
})
