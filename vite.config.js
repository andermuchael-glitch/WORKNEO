import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Almoxarifado',
        short_name: 'Almoxarifado',
        description: 'Controle de listas, produtos, cores e quantidades.',
        theme_color: '#1769e0',
        background_color: '#f6f8fb',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: []
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}']
      }
    })
  ]
});
