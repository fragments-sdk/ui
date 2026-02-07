import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Settings Page',
  description: 'Settings page with labeled sections using cards, toggles, and a save action',
  category: 'forms',
  components: ['Grid', 'Card', 'Toggle', 'Input', 'Select', 'Separator', 'Button'],
  tags: ['settings', 'preferences', 'form', 'toggle', 'layout'],
  code: `
<Grid columns={1} gap="lg">
  <Card>
    <Card.Header>
      <Card.Title>Profile</Card.Title>
      <Card.Description>Your public profile information</Card.Description>
    </Card.Header>
    <Card.Body>
      <Grid columns={2} gap="md">
        <Input label="Display Name" defaultValue={user.name} />
        <Input label="Email" type="email" defaultValue={user.email} />
        <Grid.Item colSpan="full">
          <Input label="Website" type="url" defaultValue={user.website} />
        </Grid.Item>
      </Grid>
    </Card.Body>
  </Card>

  <Card>
    <Card.Header>
      <Card.Title>Notifications</Card.Title>
      <Card.Description>Choose what you get notified about</Card.Description>
    </Card.Header>
    <Card.Body>
      <Grid columns={1} gap="sm">
        <Toggle label="Email notifications" checked={prefs.emailNotifs} onChange={onToggle('emailNotifs')} />
        <Toggle label="Push notifications" checked={prefs.pushNotifs} onChange={onToggle('pushNotifs')} />
        <Toggle label="Weekly digest" checked={prefs.digest} onChange={onToggle('digest')} />
      </Grid>
    </Card.Body>
  </Card>

  <Card>
    <Card.Header>
      <Card.Title>Appearance</Card.Title>
    </Card.Header>
    <Card.Body>
      <Select label="Theme" value={prefs.theme} onChange={onThemeChange}>
        <Select.Item value="light">Light</Select.Item>
        <Select.Item value="dark">Dark</Select.Item>
        <Select.Item value="system">System</Select.Item>
      </Select>
    </Card.Body>
  </Card>

  <Separator />
  <Button variant="primary" type="submit">Save Changes</Button>
</Grid>
`.trim(),
});
