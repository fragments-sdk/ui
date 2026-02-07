import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Dashboard Layout',
  description: 'Dashboard grid with a featured full-width card and smaller metric cards below',
  category: 'layout',
  components: ['Grid', 'Card', 'Badge', 'Separator'],
  tags: ['dashboard', 'layout', 'metrics', 'widgets', 'overview'],
  code: `
<Grid columns={4} gap="lg">
  <Grid.Item colSpan="full">
    <Card>
      <Card.Header>
        <Card.Title>Overview</Card.Title>
        <Card.Description>Key metrics for this period</Card.Description>
      </Card.Header>
      <Card.Body>{summaryContent}</Card.Body>
    </Card>
  </Grid.Item>
  <Card variant="outlined">
    <Card.Header>
      <Card.Title>Users</Card.Title>
    </Card.Header>
    <Card.Body>
      <Badge variant="success">{stats.users}</Badge>
    </Card.Body>
  </Card>
  <Card variant="outlined">
    <Card.Header>
      <Card.Title>Revenue</Card.Title>
    </Card.Header>
    <Card.Body>
      <Badge variant="info">{stats.revenue}</Badge>
    </Card.Body>
  </Card>
  <Card variant="outlined">
    <Card.Header>
      <Card.Title>Orders</Card.Title>
    </Card.Header>
    <Card.Body>
      <Badge variant="warning">{stats.orders}</Badge>
    </Card.Body>
  </Card>
  <Card variant="outlined">
    <Card.Header>
      <Card.Title>Errors</Card.Title>
    </Card.Header>
    <Card.Body>
      <Badge variant="danger">{stats.errors}</Badge>
    </Card.Body>
  </Card>
  <Grid.Item colSpan="full">
    <Separator spacing="md" />
  </Grid.Item>
  <Grid.Item colSpan={2}>
    <Card>
      <Card.Header>
        <Card.Title>Recent Activity</Card.Title>
      </Card.Header>
      <Card.Body>{activityList}</Card.Body>
    </Card>
  </Grid.Item>
  <Grid.Item colSpan={2}>
    <Card>
      <Card.Header>
        <Card.Title>Notifications</Card.Title>
      </Card.Header>
      <Card.Body>{notificationList}</Card.Body>
    </Card>
  </Grid.Item>
</Grid>
`.trim(),
});
