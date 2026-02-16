'use client';

import * as React from 'react';
import { Card } from '../../components/Card';
import { Stack } from '../../components/Stack';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Text } from '../../components/Text';

// ============================================
// Types
// ============================================

export interface LoginFormProps {
  /** Called with email/password when the form is submitted */
  onSubmit?: (data: { email: string; password: string }) => void;
  /** Shows a loading state on the submit button */
  loading?: boolean;
  /** Error message displayed above the form fields */
  error?: string;
  /** Additional CSS class name */
  className?: string;
}

// ============================================
// Component
// ============================================

export const LoginForm = React.forwardRef<HTMLFormElement, LoginFormProps>(
  function LoginForm({ onSubmit, loading = false, error, className }, ref) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit?.({ email, password });
    };

    return (
      <Card variant="elevated" className={className}>
        <Card.Header>
          <Card.Title>Sign In</Card.Title>
          <Card.Description>
            Welcome back! Please enter your details.
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <form ref={ref} onSubmit={handleSubmit}>
            <Stack gap="md">
              {error && (
                <div
                  role="alert"
                  style={{
                    padding: 'var(--fui-space-2) var(--fui-space-3)',
                    borderRadius: 'var(--fui-radius-md)',
                    backgroundColor: 'var(--fui-color-danger-bg)',
                    color: 'var(--fui-color-danger-text)',
                    fontSize: 'var(--fui-font-size-sm)',
                  }}
                >
                  {error}
                </div>
              )}
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={setEmail}
                disabled={loading}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                disabled={loading}
              />
              <div style={{ textAlign: 'right' }}>
                <Text
                  as="span"
                  size="sm"
                  color="secondary"
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Forgot password?
                </Text>
              </div>
              <Button
                variant="primary"
                fullWidth
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </form>
        </Card.Body>
        <Card.Footer>
          <Text size="sm" color="tertiary">
            Don't have an account?{' '}
            <Text
              as="span"
              size="sm"
              style={{
                color: 'var(--fui-color-accent)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign up
            </Text>
          </Text>
        </Card.Footer>
      </Card>
    );
  }
);
