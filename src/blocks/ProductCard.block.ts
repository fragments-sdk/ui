import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Product Card',
  description: 'Product display with image, price, stock badge and add to cart button',
  category: 'ecommerce',
  components: ['Card', 'Image', 'Stack', 'Text', 'Badge', 'Button'],
  tags: ['product', 'card', 'ecommerce', 'shopping'],
  code: `
<Card style={{ maxWidth: '320px' }}>
  <Image
    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
    alt="Product"
    aspectRatio="4:3"
  />
  <Card.Body>
    <Stack gap="sm">
      <Stack direction="row" justify="between" align="start">
        <Stack gap="xs">
          <Text weight="semibold">Minimalist Watch</Text>
          <Text size="sm" color="tertiary">Premium Collection</Text>
        </Stack>
        <Badge variant="success">In Stock</Badge>
      </Stack>
      <Stack direction="row" justify="between" align="center">
        <Text size="lg" weight="semibold">$299</Text>
        <Button variant="primary" size="sm">Add to Cart</Button>
      </Stack>
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
