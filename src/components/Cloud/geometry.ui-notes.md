# Geometry evidence

`GeometryEvidence.stories.tsx` is the render surface for the public catalog
coverage contract. Its story title, export name, and `data-geometry-id` values
are machine interfaces used by `libs/ui/geometry`; renaming them requires a
versioned geometry-contract change.

Every public catalog entry renders one existing component story inside a
bounded, token-styled specimen. The wrappers make screenshot coordinates stable
without duplicating component implementations. A specimen error is rendered in
place and logged so one failure cannot remove unrelated selector evidence.

The story intentionally disables the separate hosted snapshot integration. The
repository-owned geometry runner is the sole baseline authority for this page.
