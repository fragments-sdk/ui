import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Shopping Cart',
  description: 'Cart with item images, quantities, totals and checkout button',
  category: 'ecommerce',
  components: ['Card', 'Stack', 'Text', 'Image', 'Badge', 'Separator', 'Button'],
  tags: ['cart', 'shopping', 'ecommerce', 'checkout'],
  code: `
const items = [
  { name: 'Wireless Headphones', price: 199, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
  { name: 'Smart Watch', price: 299, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop' },
];

<Card>
  <Card.Header>
    <Stack direction="row" justify="between" align="center">
      <Card.Title>Shopping Cart</Card.Title>
      <Badge>2 items</Badge>
    </Stack>
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      {items.map((item) => (
        <Stack key={item.name} direction="row" gap="md" align="center">
          <Image src={item.image} alt={item.name} width={64} height={64} rounded="md" />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text weight="semibold">{item.name}</Text>
            <Text size="sm" color="tertiary">Qty: {item.quantity}</Text>
          </Stack>
          <Text weight="semibold">\${item.price}</Text>
        </Stack>
      ))}
      <Separator />
      <Stack direction="row" justify="between">
        <Text weight="semibold">Total</Text>
        <Text weight="semibold">$498</Text>
      </Stack>
    </Stack>
  </Card.Body>
  <Card.Footer>
    <Button variant="primary" fullWidth>Checkout</Button>
  </Card.Footer>
</Card>
`.trim(),
});
