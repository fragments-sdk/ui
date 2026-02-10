import { defineRecipe } from '@fragments/core';

export default defineRecipe({
  name: 'Login Form',
  description: 'Email/password authentication form with validation states',
  category: 'forms',
  components: ['Input', 'Button', 'Alert'],
  tags: ['auth', 'login', 'form'],
  code: `
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={Boolean(errors.email)}
  helperText={errors.email}
/>
<Input
  label="Password"
  type="password"
  error={Boolean(errors.password)}
  helperText={errors.password}
/>
<Button type="submit" variant="primary">Sign in</Button>
{error && (
  <Alert severity="error">
    <Alert.Icon />
    <Alert.Body>
      <Alert.Content>{error}</Alert.Content>
    </Alert.Body>
  </Alert>
)}
`.trim(),
});
