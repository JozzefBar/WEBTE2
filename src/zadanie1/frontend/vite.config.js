import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => {
          // If the path asks for a specific .php file (e.g., /api/auth/me.php, /api/import.php)
          if (path.includes('.php')) {
            return path.replace(/^\/api/, '/zadanie1/backend/api');
          }

          // Otherwise, it's a REST endpoint. Route it through index.php explicitly to bypass Nginx limitations.
          // e.g. "/api/athletes?year=2024" -> "/zadanie1/backend/api/index.php?_route=/athletes&year=2024"
          const [pathname, search] = path.split('?');
          const route = pathname.replace(/^\/api/, '');
          const query = search ? `&${search}` : '';
          return `/zadanie1/backend/api/index.php?_route=${route}${query}`;
        }
      },
    },
  },
})
