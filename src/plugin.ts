import type { App, Plugin } from 'vue'
import VSelect from '@/components/VSelect.vue'
import VSelectOption from '@/components/VSelectOption.vue'
import VSelectTag from '@/components/VSelectTag.vue'
import VTreeSelect from '@/components/VTreeSelect.vue'

export interface VueSelectPluginOptions {
  name?: string
  treeName?: string
  registerTree?: boolean
  registerInternals?: boolean
}

export const VueSelectPlugin: Plugin<[VueSelectPluginOptions?]> = {
  install(app: App, options: VueSelectPluginOptions = {}) {
    app.component(options.name ?? 'VSelect', VSelect)
    if (options.registerTree !== false) {
      app.component(options.treeName ?? 'VTreeSelect', VTreeSelect)
    }
    if (options.registerInternals) {
      app.component('VSelectOption', VSelectOption)
      app.component('VSelectTag', VSelectTag)
    }
  },
}
