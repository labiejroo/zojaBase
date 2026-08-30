import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // Port musi się zgadzać z NEXT_PUBLIC_PARENT_ORIGIN w apce rezerwacyjnej,
    // inaczej postMessage nie przejdzie i CSP zablokuje osadzenie.
    port: 5173,
    strictPort: true,
  },
});
