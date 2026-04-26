import { defineComponent, h } from 'vue'

/**
 * Inline SVGs kept in a tiny helper module so they don't blow up the main
 * SFC and so consumers can tree-shake unused icons if they swap them out.
 */
export const ChevronDownIcon = defineComponent({
  name: 'VsChevronDown',
  setup() {
    return () =>
      h(
        'svg',
        {
          viewBox: '0 0 20 20',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
        },
        [h('polyline', { points: '5 8 10 13 15 8' })],
      )
  },
})

export const CloseIcon = defineComponent({
  name: 'VsClose',
  setup() {
    return () =>
      h(
        'svg',
        {
          viewBox: '0 0 20 20',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
        },
        [h('line', { x1: 5, y1: 5, x2: 15, y2: 15 }), h('line', { x1: 15, y1: 5, x2: 5, y2: 15 })],
      )
  },
})

export const CheckIcon = defineComponent({
  name: 'VsCheck',
  setup() {
    return () =>
      h(
        'svg',
        {
          viewBox: '0 0 20 20',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 2.5,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
        },
        [h('polyline', { points: '4 11 8 15 16 6' })],
      )
  },
})
