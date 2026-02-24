import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: '../',
  preview: {
    port: parseInt(process.env.FRONTEND_PORT ?? '4173'),
    host: true,
  },
});
