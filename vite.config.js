import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In local dev, proxy /api/tryon to the Lambda URL set in .env
// Set VITE_TRYON_LAMBDA_URL in your .env.local for dev
// In production (Amplify), VITE_TRYON_LAMBDA_URL is set as an Amplify env var
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: process.env.VITE_TRYON_LAMBDA_URL
      ? {
          '/api/tryon': {
            target: process.env.VITE_TRYON_LAMBDA_URL,
            changeOrigin: true,
            rewrite: () => '',
          },
        }
      : {},
  },
});
