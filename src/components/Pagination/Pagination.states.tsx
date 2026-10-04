/**
 * State fixtures for Pagination, rendered by `pnpm run test:states`.
 *
 * @family:navigation
 * @na:loading Pagination counts pages the ledger already knows.
 * @na:error Pagination counts pages the ledger already knows.
 */
import { Stack } from "../Stack";
import { Pagination } from ".";

export function populated() {
  return (
    <Stack gap="lg">
      <Pagination totalPages={10} defaultPage={4} aria-label="Findings pages">
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
      <Pagination totalPages={10} defaultPage={4} size="sm" aria-label="Findings pages, small">
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
      <Pagination
        totalPages={10}
        defaultPage={4}
        renderLink={(page) => <a href={`#page-${page}`} />}
        aria-label="Findings pages, links"
      >
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
    </Stack>
  );
}

export function empty() {
  return (
    <Pagination totalPages={1} aria-label="Findings pages">
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  );
}

export function overflow() {
  return (
    <Pagination totalPages={240} defaultPage={120} aria-label="Findings pages">
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  );
}

// The first page is current and disabled Previous is skipped, so focus lands on the current page.
export function lifecycle() {
  return (
    <div data-states-interact="hover focus">
      <Pagination totalPages={5} defaultPage={1} aria-label="Findings pages">
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
    </div>
  );
}
