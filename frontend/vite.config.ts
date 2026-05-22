import { defineConfig } from "vite";
import react from "@vitejs/plugin-react/dist";

const backend = "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/auth/login": backend,
      "/auth/register": backend,
      "/library": backend,
      "/journal": backend,
      "/insights": backend,
      "/discover": backend,
    },
  },
});
