import { defineBlock } from '@fragments-sdk/cli/core';

export default defineBlock({
  name: 'Activity Feed Skeleton',
  description: 'Skeleton avatar circles with text rows for loading activity feeds',
  category: 'loading',
  components: ['Card', 'Stack', 'Skeleton'],
  tags: ['activity', 'feed', 'skeleton', 'loading', 'placeholder'],
  code: `
<Card>
  <Card.Header>
    <Skeleton variant="heading" width={160} />
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      {Array.from({ length: 4 }).map((_, i) => (
        <Stack key={i} direction="row" gap="md" align="center">
          <Skeleton.Circle size="sm" />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="30%" />
          </Stack>
        </Stack>
      ))}
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
