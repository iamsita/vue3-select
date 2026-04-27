# Getting Started

`vue3-select` is a single component family that covers single, multi, tags,
grouped, async, and tree pickers — all behind one consistent, generic-typed
API.

## Install

::: code-group

```bash [npm]
npm i vue3-select
```

```bash [pnpm]
pnpm add vue3-select
```

```bash [yarn]
yarn add vue3-select
```

```bash [bun]
bun add vue3-select
```

:::

The package ships ESM and CJS — bring your own bundler (Vite, Webpack,
Rollup, esbuild). `@floating-ui/vue` is a regular dependency and gets pulled
in automatically; `vue` is the only required peer.

## Use it

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from 'vue3-select'
import 'vue3-select/style.css'

const fruit = ref<string | null>(null)
</script>

<template>
  <VSelect
    v-model="fruit"
    :options="['Apple', 'Banana', 'Cherry']"
    placeholder="Pick a fruit"
  />
</template>
```

That's it. Live result:

<script setup lang="ts">
import { ref } from 'vue'
const fruit = ref(null)
</script>

<div class="demo" style="max-width: 360px;">
  <VSelect v-model="fruit" :options="['Apple', 'Banana', 'Cherry']" placeholder="Pick a fruit" />
  <div class="demo-meta">Selected: <code>{{ JSON.stringify(fruit) }}</code></div>
</div>

## Global registration (optional)

If you'd rather not import per file, register the plugin once:

```ts
// main.ts
import { createApp } from 'vue'
import { VueSelectPlugin } from 'vue3-select'
import 'vue3-select/style.css'
import App from './App.vue'

createApp(App).use(VueSelectPlugin).mount('#app')
```

`<VSelect>` and `<VTreeSelect>` are then available on every template without
an explicit `import`.

## Next steps

- [Single Select](./single-select) — primitives, objects, accessors
- [Multi Select](./multi-select) — tags, max selections, overflow
- [Async Loading](./async) — debounced search, loading states
- [Tree Select](./tree-select) — tri-state parents, "select all"
- [Headless Composables](./headless) — build a custom UI on the same primitives
- [Nuxt 3 / 4](./nuxt) — first-class Nuxt module
