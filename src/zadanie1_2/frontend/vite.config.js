import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Get the parent folder name dynamically (e.g. 'zadanie1' or 'zadanie2')
const projectFolderName = path.basename(path.resolve(process.cwd(), '..'));
const apiBase = `/${projectFolderName}/backend/api`;


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
            return path.replace(/^\/api/, apiBase);
          }

          // Otherwise, it's a REST endpoint. Route it through index.php explicitly to bypass Nginx limitations.
          const [pathname, search] = path.split('?');
          const route = pathname.replace(/^\/api/, '');
          const query = search ? `&${search}` : '';
          return `${apiBase}/index.php?_route=${route}${query}`;
        }
      },
    },
  },
})
