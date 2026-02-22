import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Registration Form',
  description: 'Signup form with name, email, password fields and terms checkbox',
  category: 'authentication',
  components: ['Card', 'Stack', 'Input', 'Checkbox', 'Button', 'Text', 'Link'],
  tags: ['auth', 'signup', 'registration', 'form'],
  code: `
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Create Account</Card.Title>
    <Card.Description>Sign up to get started with your free account.</Card.Description>
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      <Stack direction={{ base: 'column', sm: 'row' }} gap="md">
        <Input label="First Name" placeholder="John" style={{ flex: 1 }} />
        <Input label="Last Name" placeholder="Doe" style={{ flex: 1 }} />
      </Stack>
      <Input label="Email" type="email" placeholder="john@example.com" />
      <Input label="Password" type="password" placeholder="Create a password" />
      <Input label="Confirm Password" type="password" placeholder="Confirm your password" />
      <Stack direction="row" gap="sm" align="center">
        <Checkbox id="terms" />
        <Text as="label" htmlFor="terms" size="sm">
          I agree to the Terms of Service and Privacy Policy
        </Text>
      </Stack>
      <Button variant="primary" fullWidth>Create Account</Button>
    </Stack>
  </Card.Body>
  <Card.Footer>
    <Text size="sm" color="tertiary">Already have an account? <Link href="#">Sign in</Link></Text>
  </Card.Footer>
</Card>
`.trim(),
});
