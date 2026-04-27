import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// Library-build config — produces what consumers install via npm:
//   ESM (.mjs) for Vite / Webpack / Rollup / Bun / esbuild / modern Node
//   CJS (.cjs) for tools that still resolve `require(...)` (Jest, older Node)
//   .d.ts for full TypeScript intellisense
//
// We intentionally do not ship a UMD/IIFE bundle — every modern consumer
// resolves through a bundler, and the CDN drop-in path adds maintenance
// without paying for itself for an internally-consumed library.
//
// The dev server / playground lives in `vite.config.dev.ts` so this file
// stays focused on what actually ships to consumers.

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['playground/**/*', 'tests/**/*'],
      outDir: 'dist',
      entryRoot: 'src',
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.lib.json',
    }),
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
      fileName: (format) => `vue3-select.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },

    // Sourcemaps help downstream consumers debug into the published code.
    sourcemap: true,
    cssCodeSplit: false,

    rollupOptions: {
      // Externalise both the Vue peer and the floating-ui dep so the
      // consumer's package manager resolves them — never inline a peer.
      external: ['vue', '@floating-ui/vue'],
      output: {
        globals: { vue: 'Vue', '@floating-ui/vue': 'FloatingUIVue' },
        assetFileNames: (asset) => {
          const name = asset.names?.[0]
          return name === 'style.css' ? 'vue3-select.css' : (name ?? 'asset')
        },
        exports: 'named',
      },
    },
  },
})
