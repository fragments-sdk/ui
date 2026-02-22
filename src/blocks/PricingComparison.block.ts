import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Pricing Comparison',
  description: 'Multiple pricing tiers displayed side by side with features and CTAs',
  category: 'marketing',
  components: ['Grid', 'Card', 'Stack', 'Text', 'Separator', 'Button'],
  tags: ['pricing', 'plans', 'tiers', 'marketing', 'comparison'],
  code: `
const tiers = [
  { name: 'Basic', price: '$9', period: '/month', description: 'For individuals', features: ['5 projects', 'Basic analytics', 'Email support'], ctaText: 'Get Started' },
  { name: 'Pro', price: '$29', period: '/month', description: 'For small teams', features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'API access'], ctaText: 'Start Free Trial' },
  { name: 'Enterprise', price: '$99', period: '/month', description: 'For large organizations', features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'SLA guarantee'], ctaText: 'Contact Sales' },
];

<Grid columns={{ base: 1, lg: 3 }} gap="lg">
  {tiers.map((tier) => (
    <Card key={tier.name}>
      <Card.Header>
        <Card.Title>{tier.name}</Card.Title>
        <Card.Description>{tier.description}</Card.Description>
      </Card.Header>
      <Card.Body>
        <Stack gap="md">
          <Stack direction="row" align="baseline" gap="xs">
            <Text size="2xl" weight="semibold">{tier.price}</Text>
            <Text color="tertiary">{tier.period}</Text>
          </Stack>
          <Separator />
          <Stack gap="sm">
            {tier.features.map((feature) => (
              <Text key={feature}>✓ {feature}</Text>
            ))}
          </Stack>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <Button variant="primary" fullWidth>{tier.ctaText}</Button>
      </Card.Footer>
    </Card>
  ))}
</Grid>
`.trim(),
});
