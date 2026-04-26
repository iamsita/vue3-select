<script setup lang="ts">
import { ref, computed } from 'vue'
import VSelect from './lib/components/VSelect.vue'
import type { NormalizedOption } from './lib/types'

// 1. Primitives — single
const fruits = ['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry', 'Fig', 'Grape']
const fruit = ref<string | null>(null)

// 2. Object options — multi
interface Country {
  code: string
  name: string
  region: string
}
const countries: Country[] = [
  { code: 'us', name: 'United States', region: 'Americas' },
  { code: 'ca', name: 'Canada', region: 'Americas' },
  { code: 'br', name: 'Brazil', region: 'Americas' },
  { code: 'fr', name: 'France', region: 'Europe' },
  { code: 'de', name: 'Germany', region: 'Europe' },
  { code: 'gb', name: 'United Kingdom', region: 'Europe' },
  { code: 'jp', name: 'Japan', region: 'Asia' },
  { code: 'in', name: 'India', region: 'Asia' },
  { code: 'sg', name: 'Singapore', region: 'Asia' },
  { code: 'au', name: 'Australia', region: 'Oceania' },
  { code: 'nz', name: 'New Zealand', region: 'Oceania' },
]
const selectedCountries = ref<string[]>(['us', 'jp'])

// 3. Tags / taggable
const tags = ref<string[]>(['vue', 'typescript'])
const tagOptions = ref<string[]>(['vue', 'react', 'svelte', 'typescript', 'rust', 'go'])
function onCreateTag(value: string) {
  if (!tagOptions.value.includes(value)) tagOptions.value.push(value)
  tags.value = [...tags.value, value]
}

// 4. Async loading
interface User {
  id: number
  name: string
  email: string
}
const userQuery = ref('')
const userLoading = ref(false)
const userResults = ref<User[]>([])
const selectedUser = ref<number | null>(null)
let asyncTimer: number | undefined

function onUserSearch(q: string) {
  userQuery.value = q
  if (asyncTimer) window.clearTimeout(asyncTimer)
  if (!q) {
    userResults.value = []
    userLoading.value = false
    return
  }
  userLoading.value = true
  asyncTimer = window.setTimeout(() => {
    userResults.value = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `${q.charAt(0).toUpperCase()}${q.slice(1)} ${['Smith', 'Jones', 'Patel', 'Wong', 'Garcia'][i]}`,
      email: `${q.toLowerCase()}.${i + 1}@example.com`,
    }))
    userLoading.value = false
  }, 350)
}

// 5. Disabled options
const plans = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
]
const plan = ref('pro')

// 6. Custom slot rendering — show flag + region
const country = ref<string | null>('fr')
function flagFor(code: string) {
  return code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

// Theme switcher
const theme = ref<'light' | 'dark' | 'auto'>('light')
const themeBg = computed(() => (theme.value === 'dark' ? '#0b1220' : '#f8fafc'))
const themeFg = computed(() => (theme.value === 'dark' ? '#e2e8f0' : '#0f172a'))
</script>

<template>
  <main :style="{ background: themeBg, color: themeFg }">
    <header>
      <div class="brand">
        <span class="logo">▲</span>
        <h1>vue3-select</h1>
        <span class="tag">v0.1.0</span>
      </div>
      <p class="lead">
        A typed, accessible, headless-friendly select for Vue 3. Single, multi, tags,
        async, grouped — one component, zero surprises.
      </p>
      <label class="theme-switch">
        Theme
        <select v-model="theme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </label>
    </header>

    <section class="grid">
      <article class="card">
        <h2>Single — primitives</h2>
        <p>Pass an array of strings; v-model binds the chosen value.</p>
        <VSelect
          v-model="fruit"
          :options="fruits"
          :theme="theme"
          placeholder="Pick a fruit"
        />
        <pre>{{ JSON.stringify({ fruit }, null, 2) }}</pre>
      </article>

      <article class="card">
        <h2>Multi — grouped objects</h2>
        <p>Object options with custom value/label/group accessors.</p>
        <VSelect
          v-model="selectedCountries"
          mode="multiple"
          :options="countries"
          option-value="code"
          option-label="name"
          option-group="region"
          :max-visible-tags="3"
          :theme="theme"
          placeholder="Pick countries"
        />
        <pre>{{ JSON.stringify({ selectedCountries }, null, 2) }}</pre>
      </article>

      <article class="card">
        <h2>Tags — create on the fly</h2>
        <p>Type and press Enter to create new options.</p>
        <VSelect
          v-model="tags"
          mode="tags"
          :options="tagOptions"
          taggable
          :theme="theme"
          placeholder="Add tags"
          @create="onCreateTag"
        />
        <pre>{{ JSON.stringify({ tags }, null, 2) }}</pre>
      </article>

      <article class="card">
        <h2>Async — debounced search</h2>
        <p>Drive options from an async source via the search event.</p>
        <VSelect
          v-model="selectedUser"
          :options="userResults"
          :loading="userLoading"
          option-value="id"
          option-label="name"
          :theme="theme"
          placeholder="Search users…"
          no-options-text="Start typing"
          @search="onUserSearch"
        >
          <template #option="{ option }">
            <div class="user-row">
              <strong>{{ (option.raw as User).name }}</strong>
              <span class="muted">{{ (option.raw as User).email }}</span>
            </div>
          </template>
        </VSelect>
        <pre>{{ JSON.stringify({ selectedUser, query: userQuery }, null, 2) }}</pre>
      </article>

      <article class="card">
        <h2>Custom slot — flags &amp; meta</h2>
        <p>Override option and selection rendering for richer UI.</p>
        <VSelect
          v-model="country"
          :options="countries"
          option-value="code"
          option-label="name"
          option-group="region"
          :theme="theme"
          placeholder="Pick a country"
        >
          <template #option="{ option }">
            <span class="flag">{{ flagFor((option.raw as Country).code) }}</span>
            <span class="vs-option__label">{{ option.label }}</span>
            <span class="vs-option__hint">{{ (option.raw as Country).region }}</span>
          </template>
          <template #selection-text="{ selected }">
            <span class="vs-control__single">
              <span class="flag">{{ flagFor((selected[0]?.raw as Country | undefined)?.code ?? '') }}</span>
              {{ selected[0]?.label }}
            </span>
          </template>
        </VSelect>
        <pre>{{ JSON.stringify({ country }, null, 2) }}</pre>
      </article>

      <article class="card">
        <h2>Disabled options &amp; sizes</h2>
        <p>The "Enterprise" tier is disabled; size prop scales the control.</p>
        <div class="stack">
          <VSelect
            v-model="plan"
            :options="plans"
            size="sm"
            :theme="theme"
            placeholder="Plan (sm)"
          />
          <VSelect
            v-model="plan"
            :options="plans"
            size="md"
            :theme="theme"
            placeholder="Plan (md)"
          />
          <VSelect
            v-model="plan"
            :options="plans"
            size="lg"
            :theme="theme"
            placeholder="Plan (lg)"
          />
        </div>
        <pre>{{ JSON.stringify({ plan }, null, 2) }}</pre>
      </article>
    </section>

    <footer>
      <p>
        Press <kbd>↓</kbd>/<kbd>↑</kbd> to navigate, <kbd>Enter</kbd> to select,
        <kbd>Esc</kbd> to close, <kbd>⌫</kbd> to remove the last tag.
      </p>
    </footer>
  </main>
</template>

<style>
:root {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
* { box-sizing: border-box; }
body { margin: 0; }
main {
  min-height: 100vh;
  padding: 48px 24px 80px;
  transition: background 200ms ease, color 200ms ease;
}
header {
  max-width: 1080px;
  margin: 0 auto 40px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand .logo {
  font-size: 22px;
  color: #6366f1;
}
.brand h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.brand .tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
}
.lead {
  margin: 12px 0 0;
  max-width: 620px;
  color: inherit;
  opacity: 0.75;
  line-height: 1.55;
}
.theme-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 13px;
  opacity: 0.85;
}
.theme-switch select {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
}
.grid {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
[style*='#0b1220'] .card {
  background: rgba(30, 41, 59, 0.4);
  border-color: rgba(255, 255, 255, 0.08);
}
.card h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: inherit;
  opacity: 0.7;
}
.card p {
  margin: 0;
  font-size: 13px;
  opacity: 0.7;
  line-height: 1.5;
}
.card pre {
  margin: 0;
  padding: 10px 12px;
  font-size: 12px;
  background: rgba(15, 23, 42, 0.05);
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Menlo, monospace;
}
[style*='#0b1220'] .card pre {
  background: rgba(255, 255, 255, 0.04);
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.user-row {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
}
.user-row .muted {
  font-size: 0.8em;
  color: var(--vs-text-muted);
}
.flag {
  font-size: 1.2em;
  line-height: 1;
}
footer {
  max-width: 1080px;
  margin: 60px auto 0;
  font-size: 13px;
  opacity: 0.65;
}
kbd {
  font-family: inherit;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.12);
}
</style>
