# ScrollArea — UI notes

## 2026-08-14 — opt-in overflow cues

Logical-edge fade indicators remain opt-in so existing consumers do not gain
observers, animation frames, or visual overlays during a minor release. Fragments
Header, NavigationMenu, Sidebar, and Docs page asides pass `showFades` explicitly
where off-screen content needs a stronger cue.

## 2026-09-03 — private hooks only (UI refinement, Wave 0)

The unused public `--fui-scrollarea-track-size/-inline-fade/-block-fade`
hooks are deleted; the private `--_fui-scrollarea-*` properties read from
`--fui-raw-space-*` with Sass twins, and every mask/fade read carries a
fallback. Override fade depth via the raw-space tokens on the root.
