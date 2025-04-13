import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from 'tailwindcss';

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist', // default for Vite, but make sure it's here
  },
 
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env": {}, // Add an empty object to prevent process-related errors
  },
})
