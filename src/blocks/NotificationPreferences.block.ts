import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Notification Preferences',
  description: 'Checkbox list for notification settings with descriptions',
  category: 'settings',
  components: ['Card', 'Stack', 'Text', 'Checkbox', 'Button'],
  tags: ['notifications', 'preferences', 'settings', 'checkboxes'],
  code: `
const preferences = [
  { label: 'New messages', description: 'When someone sends you a direct message' },
  { label: 'Project updates', description: 'When there are updates to projects you follow' },
  { label: 'Mentions', description: 'When someone mentions you in a comment' },
  { label: 'Weekly digest', description: 'A summary of activity from the past week' },
];

<Card>
  <Card.Header>
    <Card.Title>Notification Preferences</Card.Title>
    <Card.Description>Choose what you want to be notified about</Card.Description>
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      {preferences.map((pref) => (
        <Stack key={pref.label} direction="row" gap="md" align="start">
          <Checkbox id={pref.label} defaultChecked />
          <Stack gap="xs">
            <Text as="label" htmlFor={pref.label} weight="medium">{pref.label}</Text>
            <Text size="sm" color="tertiary">{pref.description}</Text>
          </Stack>
        </Stack>
      ))}
    </Stack>
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Save Preferences</Button>
  </Card.Footer>
</Card>
`.trim(),
});
