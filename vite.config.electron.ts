import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";

export default defineConfig({
  plugins: [
    electron({
      main: {
        entry: "app/frontend/main.ts",
      },
      preload: {
        input: "app/frontend/preload.ts",
      },
      renderer: {},
    }),
  ],
});
