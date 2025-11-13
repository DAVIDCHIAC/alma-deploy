import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Permite acceso desde la red local (otras PCs o móviles)
    port: 5173,      // Puedes cambiarlo si ya está en uso
    https: {
      key: fs.readFileSync('C:/Users/josep/certs/localhost-key.pem'),
      cert: fs.readFileSync('C:/Users/josep/certs/localhost.pem'),
    },
    proxy: {
      '/api': {
        target: (import.meta as any).env?.VITE_API_BASE,
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: true,
  },
})
