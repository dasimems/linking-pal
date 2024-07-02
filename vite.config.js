import { defineConfig } from "vite";
import postcss from "vite-plugin-postcss";

export default defineConfig({
  plugins: [postcss()],
  server: {
    watch: {
      usePolling: true
    }
  }
});
