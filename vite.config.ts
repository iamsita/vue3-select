import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// Library-build config. Two passes share this file because both produce
// "the published package":
//
//   vite build              → ESM + CJS + .d.ts          (default)
//   vite build --mode umd   → IIFE for CDN, floating-ui inlined
//
// The dev server / playground lives in `vite.config.dev.ts` so this file
// stays focused on what actually ships to consumers.

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// `@floating-ui/vue` ships a `vue-demi` compatibility shim that contains a
// literal `require('vue')` call. In IIFE mode Rolldown leaves it intact,
// which would throw `ReferenceError: require is not defined` in a browser.
// Rewrite the call to the Vue global before the chunk is emitted.
const stripRequireVue = (): Plugin => ({
  name: 'vselect:strip-require-vue',
  renderChunk(code) {
    if (!code.includes('require(')) return null
    const next = code.replace(/require\(["'`]vue["'`]\)/g, 'Vue')
    return next === code ? null : { code: next, map: null }
  },
})

export default defineConfig(({ mode }) => {
  const isUmd = mode === 'umd'

  return {
    plugins: [
      vue(),
      // dts emission belongs to the canonical lib pass only — the UMD pass
      // would just overwrite the same files with identical content.
      ...(isUmd
        ? [stripRequireVue()]
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
      alias: { '@/': here('./src/') },
    },

    // The lib build must not copy `public/` into `dist/` — that's the dev
    // server's favicon, and it would otherwise ship inside the tarball.
    publicDir: false,

    build: {
      lib: {
        entry: here('./src/index.ts'),
        name: 'VueSelect',
        fileName: isUmd
          ? () => 'vue3-select.global.js'
          : (format) => `vue3-select.${format === 'es' ? 'mjs' : 'cjs'}`,
        formats: isUmd ? ['iife'] : ['es', 'cjs'],
      },

      // Sourcemaps help consumers debug the lib pass. The UMD `.map` is
      // 185 kB and CDN consumers don't typically chase library bugs
      // through their browser devtools, so we drop it. Minification uses
      // Vite's default (oxc under Rolldown-Vite), which is `true` in
      // production for both passes — leave it alone so the lib bundle
      // ships at its expected ~6.9 kB gz size.
      sourcemap: !isUmd,

      // UMD pass must NOT clear `dist/` — the lib pass ran first and wrote
      // ESM + CJS + .d.ts files we want to preserve.
      emptyOutDir: !isUmd,
      cssCodeSplit: false,

      rollupOptions: {
        // Lib externalises both peer + dep so the consumer's package
        // manager resolves them. UMD inlines floating-ui (CDN users have
        // no resolver) and only externalises Vue (loaded as a `<script>`
        // tag first by the page).
        external: isUmd ? ['vue'] : ['vue', '@floating-ui/vue'],
        output: {
          globals: (
            isUmd
              ? { vue: 'Vue' }
              : { vue: 'Vue', '@floating-ui/vue': 'FloatingUIVue' }
          ) as Record<string, string>,
          assetFileNames: (asset) => {
            const name = asset.names?.[0]
            if (name === 'style.css') {
              return isUmd ? 'vue3-select.global.css' : 'vue3-select.css'
            }
            return name ?? 'asset'
          },
          exports: 'named',
          // `extend: true` lets the IIFE attach to an existing `VueSelect`
          // global rather than overwrite it — important if the page has
          // multiple bundles or extensions registered against the name.
          ...(isUmd ? { extend: true } : {}),
        },
      },
    },
  }
})
