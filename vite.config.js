import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Caminhos relativos: funciona corretamente mesmo quando o projeto
  // é aberto como GitHub Pages em /WORKNEO/.
  base: './',
  plugins: [react()]
});
