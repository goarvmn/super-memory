import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@guesense-dash/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
