import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config with development proxy targeting 127.0.0.1 to avoid IPv6/IPv4 mismatch.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000', // use IPv4 explicitly
        changeOrigin: true,
        secure: false
      }
    }
  }
});
