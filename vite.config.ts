import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// Library-build config. Two targets share this file because they're both
// "the published package":
//
//   npm run build:lib  → ESM + CJS + .d.ts          (default)
//   npm run build:umd  → IIFE for CDN, floating-ui inlined  (BUILD_TARGET=umd)
//
// The dev server / playground lives in `vite.config.dev.ts` so this file
// stays focused on what ships to consumers.
const isUmd = process.env.BUILD_TARGET === 'umd'

// `@floating-ui/vue` ships a `vue-demi` compatibility shim with a literal
// `require('vue')` call. In IIFE mode Rolldown leaves it untouched, which
// would throw `ReferenceError: require is not defined` in a browser. This
// plugin rewrites the call to the Vue global before the chunk is emitted.
const stripRequireVue: Plugin = {
  name: 'vselect:strip-require-vue',
  renderChunk(code: string) {
    if (!code.includes('require(')) return null
    const next = code.replace(/require\(["'`]vue["'`]\)/g, 'Vue')
    return next === code ? null : { code: next, map: null }
  },
}

export default defineConfig({
  plugins: [
    vue(),
    // dts emission belongs to the canonical lib build only — the UMD pass
    // would just overwrite the same files with identical content.
    ...(isUmd
      ? [stripRequireVue]
      : [
          dts({
            include: ['src/**/*.ts', 'src/**/*.vue'],
            exclude: ['playground/**/*', 'tests/**/*'],
            outDir: 'dist',
            entryRoot: 'src',
            insertTypesEntry: true,
            tsconfigPath: './tsconfig.lib.json',
          }),
        ]),
  ],
  resolve: {
    alias: {
      '@/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/index.ts'),
      name: 'VueSelect',
      fileName: isUmd
        ? () => 'vue3-select.global.js'
        : (format) => `vue3-select.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: isUmd ? ['iife'] : ['es', 'cjs'],
    },
    sourcemap: true,
    // UMD pass must NOT clear `dist/` — the lib pass ran first and wrote
    // ESM + CJS + .d.ts files we want to preserve.
    emptyOutDir: !isUmd,
    cssCodeSplit: false,
    rollupOptions: {
      // Lib externalises both peer + dep so the consumer's package manager
      // resolves them. UMD inlines floating-ui (CDN users have no resolver)
      // and only externalises Vue (loaded as a `<script>` first).
      external: isUmd ? ['vue'] : ['vue', '@floating-ui/vue'],
      output: {
        globals: isUmd
          ? { vue: 'Vue' }
          : { vue: 'Vue', '@floating-ui/vue': 'FloatingUIVue' },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0]
          if (name === 'style.css') {
            return isUmd ? 'vue3-select.global.css' : 'vue3-select.css'
          }
          return name ?? 'asset'
        },
        exports: 'named',
        ...(isUmd ? { extend: true } : {}),
      },
    },
  },
})
