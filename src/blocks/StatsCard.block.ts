import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Stats Card',
  description: 'Metric card with value, change indicator and icon',
  category: 'dashboard',
  components: ['Card', 'Stack', 'Text', 'Badge', 'Icon'],
  tags: ['stats', 'metrics', 'kpi', 'dashboard', 'card'],
  code: `
<Card>
  <Card.Body>
    <Stack direction="row" justify="between" align="start">
      <Stack gap="xs">
        <Text size="sm" color="tertiary">Total Revenue</Text>
        <Text size="2xl" weight="semibold">$45,231</Text>
        <Stack direction="row" gap="xs" align="center">
          <Badge variant="success">+12.5%</Badge>
          <Text size="sm" color="tertiary">from last month</Text>
        </Stack>
      </Stack>
      <Icon icon={TrendUp} size="lg" color="success" />
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
