<script setup lang="ts">
import { ref } from 'vue'
import { VSelect } from '@'
import type { User } from './data'

defineProps<{ theme: 'light' | 'dark' | 'auto' }>()

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
    const surnames = ['Smith', 'Jones', 'Patel', 'Wong', 'Garcia']
    userResults.value = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `${q.charAt(0).toUpperCase()}${q.slice(1)} ${surnames[i]}`,
      email: `${q.toLowerCase()}.${i + 1}@example.com`,
    }))
    userLoading.value = false
  }, 350)
}
</script>

<template>
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
</template>
