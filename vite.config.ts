import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

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
  publicDir: false,

  build: {
    lib: {
      // Two entries: the main library and a Nuxt module. The Nuxt module is
      // built as its own chunk so consumers can register it via
      // `modules: ['vue3-select/nuxt']` without pulling Nuxt into the main
      // bundle.
      entry: {
        'vue3-select': here('./src/index.ts'),
        nuxt: here('./src/nuxt.ts'),
      },
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      external: ['vue', '@floating-ui/vue', '@nuxt/kit', '@nuxt/schema', 'nuxt'],
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
