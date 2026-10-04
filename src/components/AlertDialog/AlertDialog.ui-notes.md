# AlertDialog — UI notes

## 2026-10-03 — Glass v4 review fixes

- **What changed** — the flat part exports (`AlertDialogRoot` … `AlertDialogAction`) are cut; parts come only through dot access. Header, title, description, body, footer and close read the `overlay.modal-*` recipes (the Dialog sheet partial is folded in).
- **What works** — unit tests and the compound-identity test pass on dot access.
- **What doesn't** — the sheet geometry is not re-checked in a browser in this lane.

## 2026-10-03 — new on Glass v4 (Overlays)

- **What it is** — the Dialog sheet for a decision: `role="alertdialog"`, scrim that ignores outside presses, no corner X, focus on `AlertDialog.Cancel` when it opens. Built on the alert-dialog primitive; shares the `overlay.modal-*` recipes with Dialog and Drawer, so header, body, footer, title (title-sm) and the 16px dialog pad are one source.
- **Answers** — `AlertDialog.Cancel` and `AlertDialog.Action` are close parts. Action ignores a press in the first 500ms after opening (`ALERT_DIALOG_SETTLE_MS`), so the click or Return that opened the dialog cannot answer it.
- **What works** — unit tests cover role, Cancel focus, no corner close, settle window, outside press ignored, Escape returns focus, `render` on Cancel/Action, axe clean. A states fixture covers populated, error and lifecycleDismiss.
- **What doesn't** — not rendered in a browser in this lane; states and geometry lanes not run. Width is `sm` (default) or `md` only; a long read belongs in Dialog.
- **Candidates** — a `pending` hand-off for an Action whose work is async (keep the sheet open with a spinner on the verb until it settles); a docs page.

## 2026-10-04 — the footer's scroll edge

- **What changed** — the shared sheet footer draws a `--fui-border` hairline only while the body above it overflows. An AlertDialog body is short by design, so the line rarely shows; nothing in this component changed.
- **What doesn't** — no AlertDialog fixture overflows; the edge is checked through the Dialog and Drawer fixtures that share the recipe.
