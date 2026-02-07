import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Testimonial Card',
  description: 'Customer quote with avatar and attribution',
  category: 'marketing',
  components: ['Card', 'Stack', 'Text', 'Avatar'],
  tags: ['testimonial', 'quote', 'review', 'marketing'],
  code: `
<Card>
  <Card.Body>
    <Stack gap="md">
      <Text color="secondary" style={{ fontStyle: 'italic' }}>
        "This component library has completely transformed how we build UIs. The design is clean, the API is intuitive, and the documentation is excellent."
      </Text>
      <Stack direction="row" gap="md" align="center">
        <Avatar initials="SK" />
        <Stack gap="xs">
          <Text weight="semibold">Sarah Kim</Text>
          <Text size="sm" color="tertiary">Engineering Lead at TechCorp</Text>
        </Stack>
      </Stack>
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
