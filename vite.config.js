import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages publica este projeto em /WORKNEO/.
  base: '/WORKNEO/',
  plugins: [react()]
});
