import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'User Profile Card',
  description: 'Card displaying user info with avatar, role and actions',
  category: 'dashboard',
  components: ['Card', 'Stack', 'Text', 'Avatar', 'Badge', 'Button'],
  tags: ['profile', 'user', 'card', 'avatar', 'dashboard'],
  code: `
<Card>
  <Card.Body>
    <Stack align="center" gap="md">
      <Avatar size="xl" initials="JD" />
      <Stack align="center" gap="xs">
        <Text size="lg" weight="semibold">Jane Doe</Text>
        <Text color="tertiary">Product Designer</Text>
        <Badge variant="success">Pro Member</Badge>
      </Stack>
    </Stack>
  </Card.Body>
  <Card.Footer>
    <Stack direction="row" gap="sm" justify="center">
      <Button variant="secondary" size="sm">Message</Button>
      <Button variant="primary" size="sm">Follow</Button>
    </Stack>
  </Card.Footer>
</Card>
`.trim(),
});
