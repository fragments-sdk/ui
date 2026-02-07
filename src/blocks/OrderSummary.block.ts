import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Order Summary',
  description: 'Order details with subtotal, shipping, tax, total and shipping address',
  category: 'ecommerce',
  components: ['Card', 'Stack', 'Text', 'Separator', 'Button'],
  tags: ['order', 'summary', 'ecommerce', 'receipt'],
  code: `
<Card>
  <Card.Header>
    <Card.Title>Order Summary</Card.Title>
    <Card.Description>Order #12345</Card.Description>
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      <Stack gap="sm">
        <Stack direction="row" justify="between">
          <Text color="tertiary">Subtotal</Text>
          <Text>$498.00</Text>
        </Stack>
        <Stack direction="row" justify="between">
          <Text color="tertiary">Shipping</Text>
          <Text>$9.99</Text>
        </Stack>
        <Stack direction="row" justify="between">
          <Text color="tertiary">Tax</Text>
          <Text>$44.82</Text>
        </Stack>
      </Stack>
      <Separator />
      <Stack direction="row" justify="between">
        <Text weight="semibold">Total</Text>
        <Text size="lg" weight="semibold">$552.81</Text>
      </Stack>
      <Separator />
      <Stack gap="xs">
        <Text size="sm" weight="semibold">Shipping Address</Text>
        <Text size="sm" color="tertiary">John Doe</Text>
        <Text size="sm" color="tertiary">123 Main St, San Francisco, CA 94102</Text>
      </Stack>
    </Stack>
  </Card.Body>
  <Card.Footer>
    <Stack gap="sm" style={{ width: '100%' }}>
      <Button variant="primary" fullWidth>Confirm Order</Button>
      <Button variant="ghost" fullWidth>Continue Shopping</Button>
    </Stack>
  </Card.Footer>
</Card>
`.trim(),
});
