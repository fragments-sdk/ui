"use client";

import * as React from "react";
import { Alert } from "../../components/Alert";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Field } from "../../components/Field";
import { Input } from "../../components/Input";
import { Link } from "../../components/Link";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

// ============================================
// Types
// ============================================

export interface LoginFormProps {
  /** Called with email/password when the form is submitted */
  onSubmit?: (data: { email: string; password: string }) => void;
  /** The submit is in flight: the button holds "Signing in…"; the fields stay readable */
  pending?: boolean;
  /** Form-level error, shown in a danger alert above the fields */
  error?: string;
  /** Message for the email field; marks it invalid */
  emailError?: string;
  /** Message for the password field; marks it invalid */
  passwordError?: string;
  /** Destination of the "Forgot password?" link
   * @default "#" */
  forgotPasswordHref?: string;
  /** Destination of the "Sign up" link
   * @default "#" */
  signUpHref?: string;
  /** Additional CSS class name */
  className?: string;
}

// ============================================
// Component
// ============================================

export const LoginForm = React.forwardRef<HTMLFormElement, LoginFormProps>(function LoginForm(
  {
    onSubmit,
    pending = false,
    error,
    emailError,
    passwordError,
    forgotPasswordHref = "#",
    signUpHref = "#",
    className,
  },
  ref
) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    onSubmit?.({ email, password });
  };

  return (
    <Card className={className}>
      <Card.Header>
        <Card.Title>Sign in</Card.Title>
        <Card.Description>Welcome back. Enter your email and password.</Card.Description>
      </Card.Header>
      <Card.Body>
        <form ref={ref} onSubmit={handleSubmit} noValidate>
          <Stack gap="md">
            {error && (
              <Alert tone="danger">
                <Alert.Icon />
                <Alert.Body>
                  <Alert.Content>{error}</Alert.Content>
                </Alert.Body>
              </Alert>
            )}
            <Field invalid={Boolean(emailError)}>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onValueChange={setEmail}
                required
              />
              {emailError && <Field.Error match>{emailError}</Field.Error>}
            </Field>
            <Field invalid={Boolean(passwordError)}>
              <Field.Label>Password</Field.Label>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onValueChange={setPassword}
                required
              />
              {passwordError && <Field.Error match>{passwordError}</Field.Error>}
            </Field>
            <Stack direction="row" justify="end">
              <Text>
                <Link href={forgotPasswordHref} tone="neutral">
                  Forgot password?
                </Link>
              </Text>
            </Stack>
            <Button variant="solid" fullWidth type="submit" pending={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </form>
      </Card.Body>
      <Card.Footer>
        <Text color="tertiary">
          Don&apos;t have an account? <Link href={signUpHref}>Sign up</Link>
        </Text>
      </Card.Footer>
    </Card>
  );
});
