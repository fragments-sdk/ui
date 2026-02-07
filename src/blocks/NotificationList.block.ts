import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Notification List',
  description: 'Notification feed with avatars and timestamps',
  category: 'dashboard',
  components: ['Card', 'Stack', 'Text', 'Avatar', 'Badge'],
  tags: ['notifications', 'feed', 'list', 'dashboard'],
  code: `
const notifications = [
  { message: 'John commented on your post', time: '2 minutes ago', initials: 'JD' },
  { message: 'Sarah liked your photo', time: '1 hour ago', initials: 'SL' },
  { message: 'New follower: Mike Smith', time: '3 hours ago', initials: 'MS' },
  { message: 'Your order has shipped', time: 'Yesterday', initials: '📦' },
];

<Card>
  <Card.Header>
    <Stack direction="row" justify="between" align="center">
      <Card.Title>Notifications</Card.Title>
      <Badge>3 new</Badge>
    </Stack>
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      {notifications.map((notif, index) => (
        <Stack key={index} direction="row" gap="md" align="start">
          <Avatar size="sm" initials={notif.initials} />
          <Stack gap="xs">
            <Text>{notif.message}</Text>
            <Text size="sm" color="tertiary">{notif.time}</Text>
          </Stack>
        </Stack>
      ))}
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
