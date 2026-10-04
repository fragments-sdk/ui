// Doctrine-clean copy: the lint must stay silent here (eslint/directives.test.ts).
const API_PATH = "/v1/items";

export const statusLabels = {
  loading: "Loading…",
  save: "Save",
  empty: "No changes to check",
  format: "JSON or CSV",
};

export function describe(items: string[]) {
  const [first, ...rest] = items;
  return { first, rest, path: API_PATH, key: "SAVE_KEY" };
}
