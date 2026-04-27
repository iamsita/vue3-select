# Contributing

Thanks for considering a contribution. The aim of this guide is to get you
to a working PR as quickly as possible.

## Development setup

```bash
git clone https://github.com/matat/vue3-select.git
cd vue3-select
npm install
```

That's it — no submodules, no codegen step.

## Day-to-day commands

| Command | What it does |
|---|---|
| `npm run dev` | Run the playground at http://localhost:5173 |
| `npm test` | Run the full vitest suite |
| `npm run test:watch` | Watch mode |
| `npm run test:coverage` | Coverage report → `coverage/` |
| `npm run lint` | Run oxlint + eslint with `--fix` |
| `npm run format` | Apply prettier |
| `npm run type-check` | `vue-tsc --build` |
| `npm run build` | Type-check + lib build → `dist/` |
| `npm run docs:dev` | VitePress docs locally |
| `npm run docs:build` | Build the docs to `docs/.vitepress/dist` |

## Repo layout

```
src/
  components/    SFCs that ship to consumers
  composables/   Headless primitives (also exported)
  core/          Pure helpers — no Vue, no DOM
  styles/        SCSS partials, CSS custom properties, theme presets
  types/         Public TypeScript surface
  nuxt.ts        Nuxt module
  plugin.ts      Optional Vue plugin entry
  index.ts       Package entry — every public export lives here
tests/           vitest specs (composables, core, components)
docs/            VitePress docs site
playground/      Standalone dev playground (vite.config.dev.ts)
```

## Pull request checklist

Before you open a PR:

- [ ] `npm test` is green (existing tests + new tests for new behavior)
- [ ] `npm run lint` is clean
- [ ] `npm run type-check` passes
- [ ] `npm run build` produces a clean `dist/`
- [ ] If the public API changed, the README, the relevant doc page, and
      `CHANGELOG.md` are updated
- [ ] If you added a new export, it's listed in `src/index.ts`

CI runs all of the above automatically on every PR.

## Style

- Prettier handles formatting; run `npm run format` if your editor doesn't
- ESLint config is intentionally conservative — most "rules" are encoded as
  conventions in the existing code, so reading the surrounding file is the
  best style guide
- For SFCs: `<script setup lang="ts">` with `defineProps` / `defineEmits` /
  `defineSlots`. Avoid the Options API.
- For composables: state machine in, ref-based contract out. They run
  during `setup()` so use `onScopeDispose` for cleanup, not
  `onBeforeUnmount`.
- Comments: only when the **why** is non-obvious. The code already says the
  what.

## Commits

No strict convention. Short imperative subject, optional body. Conventional
commits (`feat:`, `fix:`, `docs:`) are welcome but not required.

## Releasing (maintainers only)

```bash
npm version patch   # or minor / major — updates package.json + CHANGELOG
git push --follow-tags
```

The `release.yml` workflow fires on tag push and publishes to npm with
provenance.

## Questions?

Open an [issue](https://github.com/matat/vue3-select/issues) — happy to
discuss before you write code.
