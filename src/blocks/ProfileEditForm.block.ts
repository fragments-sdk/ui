import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Profile Edit Form',
  description: 'User profile editor with avatar, name, email and bio fields',
  category: 'settings',
  components: ['Card', 'Stack', 'Avatar', 'Button', 'Text', 'Input', 'Textarea', 'Separator'],
  tags: ['profile', 'edit', 'form', 'settings', 'avatar'],
  code: `
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Edit Profile</Card.Title>
    <Card.Description>Update your personal information</Card.Description>
  </Card.Header>
  <Card.Body>
    <Stack gap="lg">
      <Stack direction="row" gap="md" align="center">
        <Avatar size="xl" initials="JD" />
        <Stack gap="xs">
          <Button variant="secondary" size="sm">Change Photo</Button>
          <Text size="sm" color="tertiary">JPG, PNG or GIF. Max 2MB.</Text>
        </Stack>
      </Stack>

      <Separator />

      <Stack gap="md">
        <Stack direction={{ base: 'column', sm: 'row' }} gap="md">
          <Input label="First Name" defaultValue="Jane" style={{ flex: 1 }} />
          <Input label="Last Name" defaultValue="Doe" style={{ flex: 1 }} />
        </Stack>
        <Input label="Email" type="email" defaultValue="jane@example.com" />
        <Textarea
          label="Bio"
          placeholder="Tell us about yourself..."
          defaultValue="Product designer passionate about creating intuitive user experiences."
          rows={3}
        />
      </Stack>

      <Separator />

      <Stack direction="row" gap="sm" justify="end">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save Changes</Button>
      </Stack>
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
