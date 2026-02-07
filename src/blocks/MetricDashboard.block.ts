import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Metric Dashboard',
  description: 'Grid of metrics with progress bars and change indicators',
  category: 'dashboard',
  components: ['Grid', 'Card', 'Stack', 'Text', 'Badge', 'Progress'],
  tags: ['metrics', 'dashboard', 'kpi', 'progress', 'grid'],
  code: `
const metrics = [
  { label: 'Active Users', value: '2,847', change: '+12%', progress: 75 },
  { label: 'Revenue', value: '$48,352', change: '+8%', progress: 68 },
  { label: 'Orders', value: '1,423', change: '+23%', progress: 82 },
  { label: 'Conversion', value: '3.24%', change: '-2%', progress: 45 },
];

<Grid columns={{ base: 1, md: 2 }} gap="lg">
  {metrics.map((metric) => (
    <Card key={metric.label}>
      <Card.Body>
        <Stack gap="md">
          <Stack direction="row" justify="between" align="start">
            <Stack gap="xs">
              <Text size="sm" color="tertiary">{metric.label}</Text>
              <Text size="xl" weight="semibold">{metric.value}</Text>
            </Stack>
            <Badge variant={metric.change.startsWith('+') ? 'success' : 'error'}>
              {metric.change}
            </Badge>
          </Stack>
          <Progress value={metric.progress} />
        </Stack>
      </Card.Body>
    </Card>
  ))}
</Grid>
`.trim(),
});
