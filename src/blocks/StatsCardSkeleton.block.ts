import { defineBlock } from '@fragments-sdk/cli/core';

export default defineBlock({
  name: 'Stats Card Skeleton',
  description: 'Card with skeleton metric value, label, and badge for loading stat displays',
  category: 'loading',
  components: ['Card', 'Stack', 'Skeleton'],
  tags: ['stats', 'skeleton', 'loading', 'placeholder'],
  code: `
<Card>
  <Card.Body>
    <Stack direction="row" justify="between" align="start">
      <Stack gap="sm">
        <Skeleton variant="text" width={100} />
        <Skeleton variant="heading" width={140} />
        <Stack direction="row" gap="xs" align="center">
          <Skeleton variant="button" width={60} height={22} />
          <Skeleton variant="text" width={90} />
        </Stack>
      </Stack>
      <Skeleton.Circle size="lg" />
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
