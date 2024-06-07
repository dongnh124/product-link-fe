import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [eslint({ cache: false }), react()],
  resolve: {
    alias: [
      { find: "~common", replacement: resolve(__dirname, "./src/common") },
      { find: "~components", replacement: resolve(__dirname, "./src/components") },
      { find: "~routes", replacement: resolve(__dirname, "./src/routes") },
      { find: "~store", replacement: resolve(__dirname, "./src/store") },
      { find: "~src", replacement: resolve(__dirname, "./src") },
    ]
  }
});
