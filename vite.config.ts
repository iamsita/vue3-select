import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'

// `npm run build:lib` produces a publishable npm package; `npm run dev`
// serves the playground in src/App.vue. One config covers both to keep
// configuration in a single place.
const isLib = process.env.BUILD_TARGET === 'lib'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    ...(isLib
      ? [
          dts({
            include: ['src/lib/**/*.ts', 'src/lib/**/*.vue'],
            outDir: 'dist',
            entryRoot: 'src/lib',
            insertTypesEntry: true,
            tsconfigPath: './tsconfig.lib.json',
          }),
        ]
      : [vueDevTools()]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  ...(isLib
    ? {
        build: {
          lib: {
            entry: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/lib/index.ts'),
            name: 'VueSelect',
            fileName: (format) => `vue3-select.${format === 'es' ? 'mjs' : 'cjs'}`,
            formats: ['es', 'cjs'] as const,
          },
          sourcemap: true,
          rollupOptions: {
            external: ['vue', '@floating-ui/vue'],
            output: {
              globals: {
                vue: 'Vue',
                '@floating-ui/vue': 'FloatingUIVue',
              },
              assetFileNames: (assetInfo) => {
                if (assetInfo.name === 'style.css') return 'vue3-select.css'
                return assetInfo.name ?? 'asset'
              },
            },
          },
          cssCodeSplit: false,
          emptyOutDir: true,
        },
      }
    : {}),
})
