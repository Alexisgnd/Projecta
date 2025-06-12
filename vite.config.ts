import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { version } from './package.json';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
});