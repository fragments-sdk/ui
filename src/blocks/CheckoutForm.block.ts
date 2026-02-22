import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Checkout Form',
  description: 'E-commerce checkout with billing address, payment details and order summary',
  category: 'ecommerce',
  components: ['Card', 'Stack', 'Text', 'Input', 'Separator', 'Button'],
  tags: ['checkout', 'payment', 'ecommerce', 'form', 'billing'],
  code: `
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Checkout</Card.Title>
    <Card.Description>Complete your purchase</Card.Description>
  </Card.Header>
  <Card.Body>
    <Stack gap="lg">
      <Stack gap="md">
        <Text weight="semibold">Billing Address</Text>
        <Input label="Full Name" placeholder="John Doe" />
        <Input label="Address" placeholder="123 Main St" />
        <Stack direction={{ base: 'column', sm: 'row' }} gap="md">
          <Input label="City" placeholder="San Francisco" style={{ flex: 1 }} />
          <Input label="State" placeholder="CA" style={{ width: '100px' }} />
          <Input label="ZIP" placeholder="94102" style={{ width: '120px' }} />
        </Stack>
      </Stack>

      <Separator />

      <Stack gap="md">
        <Text weight="semibold">Payment Details</Text>
        <Input label="Card Number" placeholder="4242 4242 4242 4242" />
        <Stack direction={{ base: 'column', sm: 'row' }} gap="md">
          <Input label="Expiry" placeholder="MM/YY" style={{ flex: 1 }} />
          <Input label="CVC" placeholder="123" style={{ width: '100px' }} />
        </Stack>
      </Stack>

      <Separator />

      <Stack gap="sm">
        <Stack direction="row" justify="between">
          <Text color="tertiary">Subtotal</Text>
          <Text>$99.00</Text>
        </Stack>
        <Stack direction="row" justify="between">
          <Text color="tertiary">Tax</Text>
          <Text>$8.91</Text>
        </Stack>
        <Separator />
        <Stack direction="row" justify="between">
          <Text weight="semibold">Total</Text>
          <Text weight="semibold">$107.91</Text>
        </Stack>
      </Stack>

      <Button variant="primary" fullWidth>Complete Purchase</Button>
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
