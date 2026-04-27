import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// CDN bundle config. Drives `npm run build:umd` and produces a self-contained
// IIFE bundle that inlines `@floating-ui/vue`, so a CDN consumer needs only
// two `<script>` tags: Vue itself, then this file.
//
//     <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
//     <script src="https://unpkg.com/@matat/vue3-select"></script>
//     // window.VueSelect is now populated.
//
// We use IIFE rather than UMD because Rolldown's UMD output can leak literal
// `require('vue')` calls into the bundle body (a problem with re-export
// patterns inside `@floating-ui/vue`). IIFE has no CJS detection branch so
// every Vue reference is rewritten to `window.Vue` via the `globals` map.
//
// We deliberately *don't* run `vite-plugin-dts` here — declarations come from
// `vite.config.ts` (the ESM/CJS build), which runs first and writes them to
// `dist/`. This config only emits the JS bundle and reuses the same CSS.
// `@floating-ui/vue` ships a `vue-demi` compatibility shim that contains a
// literal `require('vue')` call. In IIFE mode Rolldown leaves it untouched,
// which would throw `ReferenceError: require is not defined` in a browser.
// This plugin rewrites the call to the Vue global before the chunk is
// emitted. It's a string replacement on the final output; safer than a
// source-level transform because it touches only the few literal forms
// floating-ui-vue actually emits.
const stripRequireVue = {
  name: 'vs:strip-require-vue',
  renderChunk(code: string) {
    if (!code.includes('require(')) return null
    const next = code.replace(/require\(["'`]vue["'`]\)/g, 'Vue')
    return next === code ? null : { code: next, map: null }
  },
}

export default defineConfig({
  plugins: [vue(), stripRequireVue],
  resolve: {
    alias: {
      '@/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/index.ts'),
      name: 'VueSelect',
      fileName: () => `vue3-select.global.js`,
      formats: ['iife'],
    },
    sourcemap: true,
    // Critical: do NOT clear `dist/` — the ESM/CJS build (and its .d.ts
    // declarations) ran first and we want to preserve them.
    emptyOutDir: false,
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        // Don't overwrite the CSS the ESM build already emitted.
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0]
          if (name === 'style.css') return 'vue3-select.global.css'
          return name ?? 'asset'
        },
        exports: 'named',
        extend: true,
      },
    },
    cssCodeSplit: false,
  },
})
