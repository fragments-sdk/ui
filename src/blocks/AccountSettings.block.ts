import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Account Settings',
  description: 'Tabbed account settings with profile, security and billing sections',
  category: 'settings',
  components: ['Card', 'Tabs', 'Stack', 'Input', 'Button', 'Text'],
  tags: ['account', 'settings', 'tabs', 'profile', 'security', 'billing'],
  code: `
<Card>
  <Card.Header>
    <Card.Title>Account Settings</Card.Title>
  </Card.Header>
  <Tabs defaultValue="profile">
    <Tabs.List>
      <Tabs.Tab value="profile">Profile</Tabs.Tab>
      <Tabs.Tab value="security">Security</Tabs.Tab>
      <Tabs.Tab value="billing">Billing</Tabs.Tab>
    </Tabs.List>
    <Card.Body>
      <Tabs.Panel value="profile">
        <Stack gap="md">
          <Input label="Display Name" defaultValue="Jane Doe" />
          <Input label="Email" type="email" defaultValue="jane@example.com" />
          <Button variant="primary">Save Changes</Button>
        </Stack>
      </Tabs.Panel>
      <Tabs.Panel value="security">
        <Stack gap="md">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm Password" type="password" />
          <Button variant="primary">Update Password</Button>
        </Stack>
      </Tabs.Panel>
      <Tabs.Panel value="billing">
        <Stack gap="md">
          <Text>Current Plan: <Text weight="semibold">Pro</Text></Text>
          <Text size="sm" color="tertiary">Your next billing date will appear here</Text>
          <Button variant="secondary">Manage Subscription</Button>
        </Stack>
      </Tabs.Panel>
    </Card.Body>
  </Tabs>
</Card>
`.trim(),
});
