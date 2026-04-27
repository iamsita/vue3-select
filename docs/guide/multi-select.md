# Multi Select

Pick many values at once. Set `mode="multiple"` and v-model becomes an
array.

```vue
<script setup lang="ts">
import { ref } from 'vue'

const skills = ref<string[]>([])
</script>

<template>
  <VSelect
    v-model="skills"
    mode="multiple"
    :options="['TypeScript', 'Vue', 'React', 'Svelte', 'Solid']"
  />
</template>
```

<script setup lang="ts">
import { ref } from 'vue'
const skills = ref([])
const overflow = ref(['TypeScript', 'Vue', 'React', 'Svelte'])
const capped = ref([])
</script>

<div class="demo" style="max-width: 480px;">
  <VSelect
    v-model="skills"
    mode="multiple"
    :options="['TypeScript', 'Vue', 'React', 'Svelte', 'Solid', 'Angular', 'Qwik']"
  />
  <div class="demo-meta">Selected: <code>{{ JSON.stringify(skills) }}</code></div>
</div>

## Tag overflow

When you don't want the trigger to grow unboundedly, cap visible tags with
`max-visible-tags`. Extras collapse into a `+N` chip.

```vue
<VSelect v-model="picked" mode="multiple" :options="opts" :max-visible-tags="3" />
```

<div class="demo" style="max-width: 480px;">
  <VSelect
    v-model="overflow"
    mode="multiple"
    :options="['TypeScript', 'Vue', 'React', 'Svelte', 'Solid', 'Angular', 'Qwik']"
    :max-visible-tags="2"
  />
  <div class="demo-meta">Selected: <code>{{ JSON.stringify(overflow) }}</code></div>
</div>

## Selection cap

`max-selections` is a hard limit — picks past the cap silently no-op. Pair
with `:disabled` on a "you've reached the limit" hint slot if you want a
visible state.

```vue
<VSelect v-model="picked" mode="multiple" :options="opts" :max-selections="3" />
```

<div class="demo" style="max-width: 480px;">
  <VSelect
    v-model="capped"
    mode="multiple"
    :options="['One', 'Two', 'Three', 'Four', 'Five']"
    :max-selections="3"
    placeholder="Pick up to three"
  />
  <div class="demo-meta">Selected: <code>{{ JSON.stringify(capped) }}</code></div>
</div>

## Removing tags

- Click the × button on the tag
- Press <kbd>Backspace</kbd> when the search input is empty — pops the last tag
- Programmatically: bind to `@deselect` or call `instance.clear()`

## Closing on each pick

By default, multi mode keeps the menu open after a pick (you'll usually want
to grab another one). Override with `:close-on-select="true"`:

```vue
<VSelect v-model="x" mode="multiple" :options="opts" :close-on-select="true" />
```
