import { defineRecipe } from '@fragments/core';

export default defineRecipe({
  name: 'Login Form',
  description: 'Email/password authentication form with validation states',
  category: 'forms',
  components: ['FormField', 'Input', 'Button', 'Alert'],
  tags: ['auth', 'login', 'form'],
  code: `
<FormField label="Email" error={errors.email}>
  <Input type="email" placeholder="you@example.com" />
</FormField>
<FormField label="Password" error={errors.password}>
  <Input type="password" />
</FormField>
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
