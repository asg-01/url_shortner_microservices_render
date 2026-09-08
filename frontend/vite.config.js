import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      // Proxy all /api requests to the Spring Boot API Gateway
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react-is',
      'prop-types',
      'react-simple-maps',
      'd3-geo',
      'd3-path',
      'recharts',
    ],
  },
})
