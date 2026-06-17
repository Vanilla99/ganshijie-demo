import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/@react-three/fiber")) {
            return "react-three-fiber";
          }
          if (id.includes("node_modules/@react-three/drei")) {
            return "react-three-drei";
          }
          if (id.includes("node_modules/three")) {
            return "three-core";
          }
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "charts";
          }
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "react-vendor";
          }
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
