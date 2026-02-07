import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Forgot Password',
  description: 'Password reset request form with email field',
  category: 'authentication',
  components: ['Card', 'Stack', 'Input', 'Button', 'Text', 'Link'],
  tags: ['auth', 'password', 'reset', 'form'],
  code: `
<Card variant="elevated" style={{ maxWidth: '400px' }}>
  <Card.Header>
    <Card.Title>Reset Password</Card.Title>
    <Card.Description>Enter your email and we'll send you a reset link.</Card.Description>
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      <Input label="Email" type="email" placeholder="Enter your email" />
      <Button variant="primary" fullWidth>Send Reset Link</Button>
    </Stack>
  </Card.Body>
  <Card.Footer>
    <Text size="sm" color="tertiary">Remember your password? <Link href="#">Sign in</Link></Text>
  </Card.Footer>
</Card>
`.trim(),
});
