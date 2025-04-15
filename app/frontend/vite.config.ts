import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      "/api": {
        target: `http://localhost:${process.env.VITE_BACKEND_PORT || "3001"}`,
        changeOrigin: true,
        secure: false,
      },
      // Proxy uploads directory for images
      "/uploads": {
        target: `http://localhost:${process.env.VITE_BACKEND_PORT || "3001"}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
