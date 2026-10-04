/**
 * State fixtures for Breadcrumbs, rendered by `pnpm run test:states`.
 *
 * @family:navigation
 * @na:empty No items means no trail; the caller renders nothing.
 * @na:loading The trail is static; the page that owns it shows loading.
 * @na:error The trail is static; the page that owns it shows errors.
 */
import { Stack } from "../Stack";
import { Breadcrumbs } from ".";

export function populated() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item href="#home">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#products">Products</Breadcrumbs.Item>
      <Breadcrumbs.Item>Widget</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}

export function overflow() {
  return (
    <Stack gap="lg">
      <Breadcrumbs maxItems={3}>
        <Breadcrumbs.Item href="#home">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#category">Category</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#subcategory">Subcategory</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#section">Section</Breadcrumbs.Item>
        <Breadcrumbs.Item>Current page</Breadcrumbs.Item>
      </Breadcrumbs>
      <Breadcrumbs label="Long trail">
        <Breadcrumbs.Item href="#home">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="#long">
          A section whose title runs well past the crumb width
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>A current page whose title also runs past the width</Breadcrumbs.Item>
      </Breadcrumbs>
    </Stack>
  );
}

export function lifecycle() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item render={<a href="#home" data-states-interact="hover focus" />}>
        Home
      </Breadcrumbs.Item>
      <Breadcrumbs.Item href="#products">Products</Breadcrumbs.Item>
      <Breadcrumbs.Item>Widget</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
