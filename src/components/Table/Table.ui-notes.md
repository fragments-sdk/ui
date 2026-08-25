# Table — UI notes

## 2026-08-13 — bordered overflow

Bordered tables keep horizontal scrolling on their canonical wrapper instead of
clipping wide columns. The wrapper still hides vertical overflow so rounded
border chrome remains contained.

## 2026-08-24 — bordered cell inset

Only unbordered, card-integrated ledgers remove the first cell's inline-start
inset. A bordered Table owns its frame, so header and body content keep the
density recipe's inline inset on both edges, including hover and selected rows.
The flush selector is anchored to the owning Table structure so an unbordered
outer ledger cannot remove the inset from a bordered Table nested in one of its
cells.
