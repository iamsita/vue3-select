# @matat/vue3-select

A typed, accessible, headless-friendly select for Vue 3.
Single, multi, tags, async, grouped — one component, zero surprises.

[![npm](https://img.shields.io/npm/v/@matat/vue3-select.svg)](https://www.npmjs.com/package/@matat/vue3-select)
[![bundle](https://img.shields.io/badge/bundle-6.3kb%20gz-blue)](#)
[![types](https://img.shields.io/badge/types-included-3178c6)](#)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

- ✅ Vue 3 + TypeScript with full generics over your option type
- ✅ Single, multiple, and tags modes (with create-on-Enter)
- ✅ Searchable with custom filter functions
- ✅ Async-friendly (`@search` + `:loading`)
- ✅ Grouped options
- ✅ Floating-UI menu positioning + Teleport support
- ✅ ARIA-1.2 combobox + listbox semantics, full keyboard nav
- ✅ Themeable via CSS custom properties (light / dark / preset accents)
- ✅ Native `<form>` integration via `name` prop
- ✅ Tree-shakeable named exports + headless composables
- ✅ ~6.3 kB gz JS · ~2.1 kB gz CSS · zero runtime deps beyond `@floating-ui/vue`

---

## Install

### npm (TypeScript / bundlers)

```bash
npm i @matat/vue3-select
```

`@floating-ui/vue` is a regular dependency, so npm pulls it in automatically.

### CDN (no build step)

```html
<link rel="stylesheet" href="https://unpkg.com/@matat/vue3-select/dist/vue3-select.css" />

<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/@matat/vue3-select"></script>

<script>
  const { createApp, ref } = Vue
  const { VSelect } = VueSelect

  createApp({
    components: { VSelect },
    setup() {
      return { picked: ref(null), fruits: ['Apple', 'Banana', 'Cherry'] }
    },
    template: '<v-select v-model="picked" :options="fruits" />',
  }).mount('#app')
</script>
```

The CDN bundle inlines `@floating-ui/vue` so only Vue itself needs a separate
script tag.

## Quick start (bundler)

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

import '@matat/vue3-select/style.css'

createApp(App).mount('#app')
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from '@matat/vue3-select'

const fruit = ref<string | null>(null)
const fruits = ['Apple', 'Banana', 'Cherry']
</script>

<template>
  <VSelect v-model="fruit" :options="fruits" placeholder="Pick a fruit" />
</template>
```

## Examples

### Object options with custom accessors

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from '@matat/vue3-select'

interface Country { code: string; name: string; region: string }
const countries: Country[] = [/* … */]
const selected = ref<string[]>([])
</script>

<template>
  <VSelect
    v-model="selected"
    mode="multiple"
    :options="countries"
    option-value="code"
    option-label="name"
    option-group="region"
    :max-visible-tags="3"
  />
</template>
```

### Async loading

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from '@matat/vue3-select'

const results = ref([])
const loading = ref(false)

async function onSearch(q: string) {
  if (!q) return (results.value = [])
  loading.value = true
  results.value = await fetch(`/api/users?q=${q}`).then((r) => r.json())
  loading.value = false
}
</script>

<template>
  <VSelect
    :options="results"
    :loading="loading"
    option-value="id"
    option-label="name"
    placeholder="Search users…"
    @search="onSearch"
  />
</template>
```

### Tags / create-on-the-fly

```vue
<VSelect
  v-model="tags"
  mode="tags"
  :options="known"
  taggable
  @create="(value) => known.push(value)"
/>
```

### Custom rendering via slots

```vue
<VSelect v-model="country" :options="countries" option-value="code" option-label="name">
  <template #option="{ option }">
    <span class="flag">{{ flagFor(option.raw.code) }}</span>
    <span>{{ option.label }}</span>
  </template>
</VSelect>
```

### Headless usage

The composables that power `<VSelect>` are exported individually. Build your
own UI on top:

```ts
import { useSelection, useOptionFilter, useKeyboardNav, normalize } from '@matat/vue3-select'
```

## API

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `unknown \| unknown[]` | — | v-model — single value or array |
| `options` | `T[]` | `[]` | Source list of options |
| `mode` | `'single' \| 'multiple' \| 'tags'` | `'single'` | Selection mode |
| `optionValue` | `keyof T \| (o: T) => unknown` | `'value'` | Value accessor |
| `optionLabel` | `keyof T \| (o: T) => string` | `'label'` | Label accessor |
| `optionGroup` | `keyof T \| (o: T) => string` | — | Group key accessor |
| `optionDisabled` | `keyof T \| (o: T) => boolean` | `'disabled'` | Disabled flag |
| `placeholder` | `string` | `'Select…'` | Placeholder text |
| `searchable` | `boolean` | `true` | Show search input |
| `clearable` | `boolean` | `true` | Show clear button |
| `disabled` | `boolean` | `false` | Disable the control |
| `loading` | `boolean` | `false` | Show loading spinner |
| `closeOnSelect` | `boolean` | `mode === 'single'` | Close menu after a pick |
| `taggable` | `boolean` | `false` | Allow creating new options |
| `maxVisibleTags` | `number` | — | Collapse to "+N" beyond this count |
| `maxSelections` | `number` | — | Hard cap on multi-select |
| `filter` | `FilterFn<T>` | substring | Custom filter function |
| `caseSensitive` | `boolean` | `false` | Case-sensitive matching |
| `emptyText` | `string` | `'No options'` | Menu text when there are no options |
| `noResultsText` | `string` | falls back to `emptyText` | Menu text when search yields nothing |
| `loadingText` | `string` | `'Loading…'` | Menu text while loading |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Control size |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Theme |
| `teleportTo` | `string \| HTMLElement \| false` | `false` | Teleport menu target |
| `name` | `string` | — | Hidden input name for native forms |
| `required` | `boolean` | `false` | Native form required marker |
| `id` | `string` | auto | Override generated id |

### Events

| Event | Payload |
|---|---|
| `update:modelValue` | `unknown` |
| `update:search` | `string` |
| `search` | `string` |
| `select` | `NormalizedOption<T>` |
| `deselect` | `NormalizedOption<T>` |
| `create` | `string` |
| `open` / `close` / `focus` / `blur` | — |

### Slots

| Slot | Props | Replaces |
|---|---|---|
| `prefix` | — | The leading edge of the control |
| `suffix` | — | The trailing edge of the control |
| `value` | `{ selected, isMulti }` | The full value display area |
| `tag` | `{ option, remove, disabled }` | A single tag in multi mode |
| `option` | `{ option, selected, active, disabled }` | One row in the menu |
| `optiongroup` | `{ group }` | A group heading row |
| `empty` | `{ query, mode: 'no-options' \| 'no-results' }` | Empty-state contents |
| `loader` | `{ inMenu }` | The loading indicator |
| `dropdownicon` | `{ open }` | The chevron icon |
| `clearicon` | `{ clear }` | The clear button |
| `create` | `{ query, create }` | The "Create '<query>'" row in `taggable` mode |

### Exposed instance methods

```ts
const sel = ref<VSelectInstance>()
sel.value?.open() // close, toggle, focus, blur, clear, isOpen
```

## Theming

All colors, spacing, and motion live as CSS custom properties scoped to `.vs`,
so you can override at any level without recompiling SCSS:

```css
.my-form .vselect {
  --vselect-accent: #ec4899;
  --vselect-radius: 12px;
  --vselect-border-focus: #ec4899;
}
```

The default stylesheet is wrapped in `@layer vselect`, so consumer rules
written outside any layer always win without specificity hacks.

Built-in dark mode:

```vue
<VSelect theme="dark" />
<VSelect theme="auto" /> <!-- follows prefers-color-scheme -->
```

Accent presets ship as separate SCSS files:

```scss
@use '@matat/vue3-select/scss/themes/emerald';
@use '@matat/vue3-select/scss/themes/rose';
```

```vue
<VSelect class="vselect--emerald" />
```

## Accessibility

- Implements WAI-ARIA 1.2 combobox + listbox patterns
- `aria-activedescendant` updates as the user navigates
- Full keyboard support: ↑/↓, Home, End, Enter, Esc, Tab, Backspace
- Focus management is preserved across menu open/close and tag removal
- Honors `prefers-reduced-motion`

## Browser support

Modern evergreen browsers. ES2020 baseline. SSR friendly (no DOM access at module load).

## Development

```bash
npm install
npm run dev          # playground at http://localhost:5173
npm run test         # vitest
npm run build        # type-check + lib build → dist/
npm run build:demo   # static playground build
```

## License

MIT © Matat
