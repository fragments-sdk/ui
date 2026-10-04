import { defineBlock } from "@usefragments/core";

export default defineBlock({
  name: "Activity Feed",
  description: "Recent actions as a list: square avatar, actor and action, a timestamp in ink 3",
  category: "dashboard",
  components: ["Card", "Stack", "Text", "Avatar", "Button"],
  tags: ["activity", "feed", "timeline", "notifications"],
  code: `
const activities = [
  { id: '1', user: 'Alice Chen', action: 'created a new project', time: '2 minutes ago' },
  { id: '2', user: 'Bob Smith', action: 'commented on your post', time: '15 minutes ago' },
  { id: '3', user: 'Carol Davis', action: 'shared a document', time: '1 hour ago' },
  { id: '4', user: 'Dan Wilson', action: 'completed a task', time: '3 hours ago' },
];

<Card>
  <Card.Header>
    <Card.Title>Recent activity</Card.Title>
  </Card.Header>
  <Card.Body>
    <Stack as="ul" gap="md">
      {activities.map((activity) => (
        <li key={activity.id}>
          <Stack direction="row" gap="md" align="start">
            <Avatar name={activity.user} size="xs" />
            <Stack gap="none">
              <Text as="p" color="secondary">
                <Text color="primary" strong>{activity.user}</Text> {activity.action}
              </Text>
              <Text type="caption" color="tertiary" tabularNums>{activity.time}</Text>
            </Stack>
          </Stack>
        </li>
      ))}
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
