import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Login Form',
  description: 'Email/password authentication form with card layout and footer links',
  category: 'authentication',
  components: ['Card', 'Stack', 'Input', 'Button', 'Text', 'Link'],
  tags: ['auth', 'login', 'signin', 'form'],
  code: `
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Sign In</Card.Title>
    <Card.Description>Welcome back! Please enter your details.</Card.Description>
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      <Input label="Email" type="email" placeholder="Enter your email" />
      <Input label="Password" type="password" placeholder="Enter your password" />
      <Link href="#" variant="subtle"><Text size="sm">Forgot password?</Text></Link>
      <Button variant="primary" fullWidth>Sign In</Button>
    </Stack>
  </Card.Body>
  <Card.Footer>
    <Text size="sm" color="tertiary">Don't have an account? <Link href="#">Sign up</Link></Text>
  </Card.Footer>
</Card>
`.trim(),
});
