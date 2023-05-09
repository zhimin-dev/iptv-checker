import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'/',
  server: {
    proxy: {
      '/check-url-is-available': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    }
  }
})
