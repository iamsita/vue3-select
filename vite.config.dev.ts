import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Dev / playground config. Drives `npm run dev` and `npm run build:demo`.
// The library build lives in `vite.config.ts` — kept separate so neither
// file mixes "what we ship" with "how we test what we ship".
export default defineConfig({
  base: process.env.BASE_URL ?? '/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      // The playground imports from `@` as if it were a downstream consumer,
      // resolving directly to the public package entry.
      '@': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      '@/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
})
