import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Settings Panel',
  description: 'Settings panel with toggles and descriptions',
  category: 'settings',
  components: ['Card', 'Stack', 'Text', 'Toggle'],
  tags: ['settings', 'toggles', 'preferences', 'panel'],
  code: `
const settings = [
  { label: 'Email Notifications', description: 'Receive updates via email', defaultChecked: true },
  { label: 'Push Notifications', description: 'Receive push notifications on your device', defaultChecked: false },
  { label: 'Marketing Emails', description: 'Receive product updates and tips', defaultChecked: false },
];

<Card>
  <Card.Header>
    <Card.Title>Settings</Card.Title>
  </Card.Header>
  <Card.Body>
    <Stack gap="lg">
      {settings.map((setting) => (
        <Stack key={setting.label} direction="row" justify="between" align="center">
          <Stack gap="xs">
            <Text weight="medium">{setting.label}</Text>
            <Text size="sm" color="tertiary">{setting.description}</Text>
          </Stack>
          <Toggle defaultChecked={setting.defaultChecked} />
        </Stack>
      ))}
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
