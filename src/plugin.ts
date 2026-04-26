import type { App, Plugin } from 'vue'
import VSelect from './components/VSelect.vue'
import VSelectOption from './components/VSelectOption.vue'
import VSelectTag from './components/VSelectTag.vue'

export interface VueSelectPluginOptions {
  /** Override the global tag for `<VSelect>` (default: 'VSelect'). */
  name?: string
  /** Register `VSelectOption` and `VSelectTag` globally too (default: false). */
  registerInternals?: boolean
}

/**
 * Optional plugin entry — `app.use(VueSelectPlugin)` registers `<VSelect />`
 * globally. Most consumers should prefer the named import for tree-shaking.
 */
export const VueSelectPlugin: Plugin<[VueSelectPluginOptions?]> = {
  install(app: App, options: VueSelectPluginOptions = {}) {
    app.component(options.name ?? 'VSelect', VSelect)
    if (options.registerInternals) {
      app.component('VSelectOption', VSelectOption)
      app.component('VSelectTag', VSelectTag)
    }
  },
}
