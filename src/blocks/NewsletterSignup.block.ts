import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Newsletter Signup',
  description: 'Compact email signup with inline button',
  category: 'marketing',
  components: ['Card', 'Stack', 'Text', 'Input', 'Button'],
  tags: ['newsletter', 'signup', 'email', 'marketing'],
  code: `
<Card variant="outlined">
  <Card.Body>
    <Stack gap="md">
      <Stack gap="xs">
        <Text size="lg" weight="semibold">Stay Updated</Text>
        <Text color="tertiary">Get the latest news and updates delivered to your inbox.</Text>
      </Stack>
      <Stack direction={{ base: 'column', sm: 'row' }} gap="sm">
        <Input type="email" placeholder="Enter your email" style={{ flex: 1 }} />
        <Button variant="primary">Subscribe</Button>
      </Stack>
      <Text size="sm" color="tertiary">No spam, unsubscribe anytime.</Text>
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
