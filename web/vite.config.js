import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 배포 대상: https://baessi963-hub.github.io/tariff-mobile/
const repo = "tariff-mobile";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? `/${repo}/` : "/",
  css: { postcss: false },
  define: {
    "import.meta.env.VITE_BUILD_TIME": JSON.stringify(new Date().toISOString())
  },
  server: { port: 5173 }
}));