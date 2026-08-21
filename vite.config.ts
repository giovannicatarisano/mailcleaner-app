import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_CAPACITOR=true  → base './'  per APK Android (carica da file:///)
// NODE_ENV=production  → base '/mailcleaner-app/'  per GitHub Pages
// dev                  → base '/'
const base = process.env.VITE_CAPACITOR === 'true'
  ? './'
  : process.env.NODE_ENV === 'production'
    ? '/mailcleaner-app/'
    : '/';

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173,
    host: true,
  },
});
