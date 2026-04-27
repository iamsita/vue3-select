import { addComponent, addImportsSources, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'

export interface ModuleOptions {
  /**
   * Auto-register `<VSelect>`, `<VTreeSelect>`, and the supporting subcomponents
   * as Nuxt components. With this on, templates can use the tags directly
   * without an explicit `import`. Default: `true`.
   */
  components?: boolean
  /**
   * Optional prefix applied to the auto-registered component names — useful
   * for projects that already have a `<VSelect>` component. With `prefix: 'My'`
   * the components become `<MySelect>`, `<MyTreeSelect>`, etc.
   * Default: no prefix.
   */
  prefix?: string
  /**
   * Auto-import the headless composables (`useSelection`, `useTreeSelection`,
   * `useOptionFilter`, `useKeyboardNav`, `useStableId`, `useDebounced`).
   * Default: `false` — opt in if you build custom UI on top of the primitives.
   */
  composables?: boolean
  /**
   * Inject the prebuilt stylesheet into Nuxt's `css` array. Disable if you
   * import the SCSS source manually for token-level theming.
   * Default: `true`.
   */
  css?: boolean
}

const COMPONENT_NAMES = [
  'VSelect',
  'VSelectOption',
  'VSelectTag',
  'VTreeSelect',
  'VTreeSelectNode',
] as const

const COMPOSABLE_NAMES = [
  'useSelection',
  'useTreeSelection',
  'useOptionFilter',
  'useKeyboardNav',
  'useStableId',
  'useDebounced',
] as const

/**
 * Nuxt 3 module — opt-in via `nuxt.config.ts`:
 *
 *     export default defineNuxtConfig({
 *       modules: ['vue3-select/nuxt'],
 *     })
 *
 * Or with options under the `vue3Select` key:
 *
 *     export default defineNuxtConfig({
 *       modules: ['vue3-select/nuxt'],
 *       vue3Select: { prefix: 'My', composables: true },
 *     })
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue3-select',
    configKey: 'vue3Select',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    components: true,
    prefix: '',
    composables: false,
    css: true,
  },
  setup(options: ModuleOptions, nuxt: Nuxt) {
    if (options.css) {
      nuxt.options.css ||= []
      if (!nuxt.options.css.includes('vue3-select/style.css')) {
        nuxt.options.css.push('vue3-select/style.css')
      }
    }

    if (options.components) {
      const prefix = options.prefix ?? ''
      for (const name of COMPONENT_NAMES) {
        addComponent({
          name: prefix ? `${prefix}${name.slice(1)}` : name,
          export: name,
          filePath: 'vue3-select',
        })
      }
    }

    if (options.composables) {
      addImportsSources({
        from: 'vue3-select',
        imports: [...COMPOSABLE_NAMES],
      })
    }
  },
})
