import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import vike from 'vike/plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vike(),
  ],
  // dev 전용: Codespaces 포워딩 도메인(*.app.github.dev)에서 접속 허용.
  // (미설정 시 Vite 가 "Blocked request. This host is not allowed." 403 반환)
  server: {
    host: true,
    allowedHosts: ['.app.github.dev'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/@supabase') || id.includes('node_modules/supabase')) {
            return 'supabase-vendor'
          }
        },
      },
    },
    cssCodeSplit: true,
    target: 'es2020',
    minify: 'esbuild',
  },
})
