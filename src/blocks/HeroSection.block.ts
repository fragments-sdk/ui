import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Hero Section',
  description: 'Landing page hero with headline, description and CTA buttons',
  category: 'marketing',
  components: ['Stack', 'Text', 'Button', 'Image'],
  tags: ['hero', 'landing', 'marketing', 'cta'],
  code: `
<Stack gap="xl" align="center" style={{ textAlign: 'center', padding: '64px 24px' }}>
  <Stack gap="md" align="center" style={{ maxWidth: '600px' }}>
    <Text as="h1" size="2xl" weight="semibold">Build beautiful products faster</Text>
    <Text size="lg" color="secondary">
      A modern component library designed for developers who want to ship quality interfaces without the complexity.
    </Text>
  </Stack>
  <Stack direction={{ base: 'column', sm: 'row' }} gap="md">
    <Button variant="primary">Get Started</Button>
    <Button variant="secondary">Learn More</Button>
  </Stack>
  <Image
    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop"
    alt="Code on screen"
    aspectRatio="16:9"
    rounded="lg"
    width="100%"
    style={{ maxWidth: '800px' }}
  />
</Stack>
`.trim(),
});
