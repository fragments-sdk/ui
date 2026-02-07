import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Activity Feed',
  description: 'Timeline of user activities with avatars and timestamps',
  category: 'dashboard',
  components: ['Card', 'Stack', 'Text', 'Avatar'],
  tags: ['activity', 'feed', 'timeline', 'dashboard'],
  code: `
const activities = [
  { user: 'Alice Chen', action: 'created a new project', time: '2 minutes ago', initials: 'AC' },
  { user: 'Bob Smith', action: 'commented on your post', time: '15 minutes ago', initials: 'BS' },
  { user: 'Carol Davis', action: 'shared a document', time: '1 hour ago', initials: 'CD' },
  { user: 'Dan Wilson', action: 'completed a task', time: '3 hours ago', initials: 'DW' },
];

<Card>
  <Card.Header>
    <Card.Title>Recent Activity</Card.Title>
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      {activities.map((activity, index) => (
        <Stack key={index} direction="row" gap="md" align="center">
          <Avatar size="sm" initials={activity.initials} />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text>
              <Text weight="semibold">{activity.user}</Text> {activity.action}
            </Text>
            <Text size="sm" color="tertiary">{activity.time}</Text>
          </Stack>
        </Stack>
      ))}
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
