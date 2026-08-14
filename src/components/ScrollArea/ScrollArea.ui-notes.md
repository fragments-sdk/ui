# ScrollArea — UI notes

## 2026-08-14 — opt-in overflow cues

Logical-edge fade indicators remain opt-in so existing consumers do not gain
observers, animation frames, or visual overlays during a minor release. Fragments
Header, NavigationMenu, Sidebar, and Docs page asides pass `showFades` explicitly
where off-screen content needs a stronger cue.
