import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Feature Grid',
  description: 'Grid of features with icons and descriptions',
  category: 'marketing',
  components: ['Grid', 'Card', 'Stack', 'Icon', 'Text'],
  tags: ['features', 'grid', 'marketing', 'icons'],
  code: `
const features = [
  { icon: Rocket, title: 'Fast Performance', description: 'Optimized for speed with minimal bundle size' },
  { icon: Shield, title: 'Secure by Default', description: 'Built-in security best practices' },
  { icon: Puzzle, title: 'Modular Design', description: 'Pick only what you need' },
  { icon: Sparkle, title: 'Modern Stack', description: 'Built with the latest technologies' },
];

<Grid columns={{ base: 1, md: 2, lg: 4 }} gap="lg">
  {features.map((feature) => (
    <Card key={feature.title}>
      <Card.Body>
        <Stack gap="md">
          <Icon icon={feature.icon} size="lg" variant="accent" />
          <Stack gap="xs">
            <Text weight="semibold">{feature.title}</Text>
            <Text size="sm" color="tertiary">{feature.description}</Text>
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  ))}
</Grid>
`.trim(),
});
