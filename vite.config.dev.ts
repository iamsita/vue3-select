import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Dev server / playground build. Drives `npm run dev` and `npm run build:demo`.
// The library build lives in `vite.config.ts` — kept separate so neither file
// mixes "what we ship" with "how we test what we ship".

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  // Allow deploying the demo under a subpath (e.g. GitHub Pages project page)
  // by setting `BASE_URL=/vue3-select/` at build time.
  base: process.env.BASE_URL ?? '/',

  plugins: [vue(), vueDevTools()],

  resolve: {
    alias: {
      // The playground imports from `@` as if it were a downstream consumer,
      // resolving directly to the public package entry. The trailing-slash
      // alias keeps deep imports routable for ad-hoc internal debugging.
      '@': here('./src/index.ts'),
      '@/': here('./src/'),
    },
  },

  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: false,
  },
})
