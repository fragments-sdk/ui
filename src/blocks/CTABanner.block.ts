import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'CTA Banner',
  description: 'Call-to-action banner with accent background and button',
  category: 'marketing',
  components: ['Card', 'Stack', 'Text', 'Button'],
  tags: ['cta', 'banner', 'marketing', 'call-to-action'],
  code: `
<Card style={{ background: 'var(--fui-color-accent)', color: 'var(--fui-text-inverse)' }}>
  <Card.Body>
    <Stack direction="row" justify="between" align="center" gap="lg" style={{ flexWrap: 'wrap' }}>
      <Stack gap="xs">
        <Text size="lg" weight="semibold" style={{ color: 'inherit' }}>Ready to get started?</Text>
        <Text style={{ color: 'var(--fui-text-inverse)', opacity: 0.8 }}>Join thousands of developers building with our components.</Text>
      </Stack>
      <Button variant="secondary" style={{ background: 'var(--fui-bg-primary)', color: 'var(--fui-color-accent)' }}>
        Start Free Trial
      </Button>
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
