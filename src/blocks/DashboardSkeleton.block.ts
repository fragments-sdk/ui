import { defineBlock } from '@fragments-sdk/cli/core';

export default defineBlock({
  name: 'Dashboard Skeleton',
  description: 'Grid of card shells with skeleton text and headings for dashboard loading states',
  category: 'loading',
  components: ['Card', 'Grid', 'Skeleton'],
  tags: ['dashboard', 'skeleton', 'loading', 'placeholder'],
  code: `
<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
  {Array.from({ length: 6 }).map((_, i) => (
    <Card key={i}>
      <Card.Body>
        <Stack gap="md">
          <Skeleton variant="heading" width="60%" />
          <Skeleton.Text lines={2} />
          <Skeleton variant="rect" height={120} radius="md" />
          <Stack direction="row" gap="sm" align="center">
            <Skeleton variant="button" width={80} />
            <Skeleton variant="text" width={60} />
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  ))}
</Grid>
`.trim(),
});
