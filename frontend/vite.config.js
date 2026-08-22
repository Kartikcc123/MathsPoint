import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://mathspoint-yqnv.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
            if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('swiper') || id.includes('framer-motion')) return 'vendor-ui';
            if (id.includes('recharts')) return 'vendor-charts';
            return 'vendor'; // Fallback for other node_modules
          }
        },
      },
    },
  },
})
