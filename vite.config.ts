import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In produzione (GitHub Pages) usiamo il path assoluto /mailcleaner-app/
// In sviluppo locale usiamo '/'
const base = process.env.NODE_ENV === 'production' ? '/mailcleaner-app/' : '/';

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5173,
    host: true,
  },
});
