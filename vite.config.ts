import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// Library build config. Drives `npm run build:lib`, which emits the
// publishable npm package into `dist/`. The dev playground has its own
// config at `vite.config.playground.ts` so this file stays focused.
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
    alias: {
      '@/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/index.ts'),
      name: 'VueSelect',
      fileName: (format) => `vue3-select.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
    rollupOptions: {
      // Externalise everything declared in `peerDependencies` and
      // `dependencies` so npm resolves them at install time and the lib
      // bundle stays focused on its own code.
      external: ['vue', '@floating-ui/vue'],
      output: {
        globals: {
          vue: 'Vue',
          '@floating-ui/vue': 'FloatingUIVue',
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0]
          if (name === 'style.css') return 'vue3-select.css'
          return name ?? 'asset'
        },
        exports: 'named',
      },
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
})
