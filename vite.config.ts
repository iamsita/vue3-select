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
      entry: here('./src/index.ts'),
      fileName: (format) => `vue3-select.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
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
