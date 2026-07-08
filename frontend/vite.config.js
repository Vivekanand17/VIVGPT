import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "../static",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/chat": "http://127.0.0.1:8080",
      "/conversations": "http://127.0.0.1:8080",
      "/history": "http://127.0.0.1:8080",
      "/upload": "http://127.0.0.1:8080",
    },
  },
});
