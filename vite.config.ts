import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'

// `npm run build:lib` (BUILD_TARGET=lib) emits the publishable package;
// `npm run dev` and `npm run build:demo` use the same config to drive the
// playground at /playground/.
const isLib = process.env.BUILD_TARGET === 'lib'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    ...(isLib
      ? [
          dts({
            include: ['src/**/*.ts', 'src/**/*.vue'],
            exclude: ['playground/**/*', 'tests/**/*'],
            outDir: 'dist',
            entryRoot: 'src',
            insertTypesEntry: true,
            tsconfigPath: './tsconfig.lib.json',
          }),
        ]
      : [vueDevTools()]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      '@/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
  ...(isLib
    ? {
        build: {
          lib: {
            entry: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/index.ts'),
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
              exports: 'named',
            },
          },
          cssCodeSplit: false,
          emptyOutDir: true,
        },
      }
    : {}),
})
