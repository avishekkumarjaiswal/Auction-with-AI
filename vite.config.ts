
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill process.env to prevent crashes when SDKs access it in the browser
    'process.env': {},
    // Polyfill global for some older libraries
    'global': 'window',
  }
});
