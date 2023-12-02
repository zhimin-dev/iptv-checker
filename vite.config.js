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
      '/fetch-m3u-body': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
})
