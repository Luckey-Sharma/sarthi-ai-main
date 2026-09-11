import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sarthiServerPlugin } from './server/sarthiPlugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sarthiServerPlugin()
  ],
  server: {
    port: 5173,
    host: true
  }
})
