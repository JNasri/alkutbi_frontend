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
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'primereact-vendor': ['primereact', 'primeicons', 'primeflex'],
          'utils': ['date-fns', 'moment-hijri', 'jwt-decode'],
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'icons': ['lucide-react', 'react-icons'],
          'export': ['xlsx', 'file-saver', 'jspdf', 'jspdf-autotable', 'html2canvas'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
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
});

