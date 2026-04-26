import type { App } from 'vue'
import VSelect from './components/VSelect.vue'

export { VSelect }

export type {
  NormalizedOption,
  OptionLike,
  OptionAccessor,
  SelectMode,
  SelectSize,
  FilterFn,
  FilterContext,
  VSelectProps,
  VSelectEmits,
  VSelectInstance,
  OptionSlotProps,
  SelectionSlotProps,
} from './types'

export { useSelect } from './composables/useSelect'
export { useFilter } from './composables/useFilter'
export { useKeyboard } from './composables/useKeyboard'
export { useId } from './composables/useId'
export { normalize, defaultFilter, toggleValue } from './utils'

/**
 * Optional Vue plugin entry — `app.use(VueSelectPlugin)` registers <v-select />
 * globally. Most consumers will prefer the named import for tree-shaking.
 */
export const VueSelectPlugin = {
  install(app: App) {
    app.component('VSelect', VSelect)
  },
}
