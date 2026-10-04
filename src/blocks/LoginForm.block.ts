import { defineBlock } from "@usefragments/core";

export default defineBlock({
  name: "Login Form",
  description: "Email and password sign-in on a card, with a pending submit and footer links",
  category: "authentication",
  components: ["Card", "Stack", "Field", "Input", "Button", "Text", "Link"],
  tags: ["auth", "login", "signin", "form"],
  code: `
<Card>
  <Card.Header>
    <Card.Title>Sign in</Card.Title>
    <Card.Description>Welcome back. Enter your email and password.</Card.Description>
  </Card.Header>
  <Card.Body>
    <form noValidate>
      <Stack gap="md">
        <Field>
          <Field.Label>Email</Field.Label>
          <Input type="email" name="email" autoComplete="email" placeholder="you@example.com" required />
        </Field>
        <Field>
          <Field.Label>Password</Field.Label>
          <Input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />
        </Field>
        <Stack direction="row" justify="end">
          <Text>
            <Link href="#" tone="neutral">Forgot password?</Link>
          </Text>
        </Stack>
        <Button variant="solid" fullWidth type="submit">Sign in</Button>
      </Stack>
    </form>
  </Card.Body>
  <Card.Footer>
    <Text color="tertiary">
      Don't have an account? <Link href="#">Sign up</Link>
    </Text>
  </Card.Footer>
</Card>
`.trim(),
});
