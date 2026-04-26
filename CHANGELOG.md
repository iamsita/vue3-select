# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-04-26

### Added

- Initial release of `<VSelect>` with single, multiple, and tags modes.
- Generic `<T>` component — typed accessors for `optionValue` / `optionLabel` /
  `optionGroup` / `optionDisabled`.
- Searchable input with custom `filter` prop and `caseSensitive` mode.
- Async support: `@search` event + `:loading` prop.
- Grouped options via `optionGroup`.
- Floating-UI menu positioning with collision flip/shift and width matching.
- Optional `teleportTo` for body-mounted menus.
- ARIA-1.2 combobox + listbox semantics.
- Keyboard navigation: ↑/↓, Home, End, Enter, Esc, Tab, Backspace.
- Slot API: `prepend`, `append`, `selection`, `selection-text`, `option`,
  `group-label`, `no-options`, `no-results`, `loading`, `indicator`, `clear`,
  `create`.
- Native form integration via `name` prop (hidden inputs in FormData).
- Themeable via CSS custom properties — light, dark, and `auto` themes.
- Accent presets: emerald, rose (SCSS subpath imports).
- Headless composables: `useSelection`, `useOptionFilter`, `useKeyboardNav`,
  `useStableId`.
- Core helpers: `normalize`, `defaultFilter`, `toggleValue`, `valuesEqual`,
  `escapeRegex`, `readAccessor`, `isPrimitive`.
- Three sizes: `sm` / `md` / `lg`.
- Optional Vue plugin (`VueSelectPlugin`) for global registration.
