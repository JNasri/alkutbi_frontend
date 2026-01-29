import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), 
    react({
      // Enable Fast Refresh for better dev experience
      fastRefresh: true,
    })
  ],
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      // Exclude PrimeReact's optional peer dependencies that we don't use
      external: ['chart.js/auto', 'quill', 'fullcalendar'],
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'primereact-vendor': ['primereact'],
          'utils': ['date-fns', 'moment-hijri', 'jwt-decode'],
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'icons': ['lucide-react', 'react-icons'],
          'export': ['xlsx', 'file-saver', 'jspdf', 'jspdf-autotable', 'html2canvas'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification with esbuild (built into Vite)
    minify: 'esbuild',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
    ],
  },
  server: {
    host: true,
    port: 5173,
  },
});

