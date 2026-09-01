import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { apiDevPlugin } from './vite-api-plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevPlugin()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/exceljs')) return 'exceljs'
          if (id.includes('node_modules')) return 'vendor'
          return undefined
        },
      },
    },
  },
})
