import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// IMPORTANTE: troque "fila-producao" pelo nome exato do seu repositório no GitHub.
// Se o site vai ficar em https://SEUUSUARIO.github.io/fila-producao/, o base é "/fila-producao/".
export default defineConfig({
  base: "/fila-producao/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Fila de Produção",
        short_name: "Produção",
        description: "Corte, sublimação, costura e separação em um só painel.",
        theme_color: "#1c2a3a",
        background_color: "#f2ede2",
        display: "standalone",
        start_url: ".",
        scope: ".",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      },
    }),
  ],
});
