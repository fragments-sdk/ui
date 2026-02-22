import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Table Skeleton',
  description: 'Table-shaped skeleton rows for loading data tables',
  category: 'loading',
  components: ['Card', 'Stack', 'Skeleton'],
  tags: ['table', 'skeleton', 'loading', 'placeholder'],
  code: `
<Card>
  <Card.Header>
    <Stack direction="row" justify="between" align="center">
      <Skeleton variant="heading" width={120} />
      <Skeleton variant="input" width={200} />
    </Stack>
  </Card.Header>
  <Card.Body>
    <Stack gap="none">
      {/* Table header row */}
      <Stack direction="row" gap="lg" style={{ padding: 'var(--fui-space-2) 0', borderBottom: '1px solid var(--fui-border)' }}>
        <Skeleton variant="text" width="25%" />
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="20%" />
        <Skeleton variant="text" width="15%" />
      </Stack>
      {/* Table body rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Stack key={i} direction="row" gap="lg" align="center" style={{ padding: 'var(--fui-space-2) 0', borderBottom: '1px solid var(--fui-border)' }}>
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="button" width="20%" />
          <Skeleton variant="text" width="15%" />
        </Stack>
      ))}
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
