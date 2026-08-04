import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Config shape follows Tauri's documented Vite integration: a fixed dev
// server port (matched in crates/atlas-app/tauri.conf.json's `devUrl`),
// no auto-open (Tauri opens its own window), and ignoring the Rust
// workspace so Vite's file watcher doesn't react to `cargo build` output.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/crates/**", "**/target/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "es2022",
    minify: "esbuild",
    sourcemap: true,
  },
});
