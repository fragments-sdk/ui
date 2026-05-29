import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '.';

/**
 * Alert surfaces contextual feedback messages tied to user actions or system
 * status. It is a compound component: compose Alert.Icon, Alert.Body,
 * Alert.Title, Alert.Content, Alert.Actions, Alert.Action, and Alert.Close.
 */
const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Contextual feedback messages for user actions or system status with severity levels.',
      },
    },
  },
  argTypes: {
    severity: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Visual severity level',
    },
  },
  args: {
    severity: 'info',
    children: (
      <>
        <Alert.Icon />
        <Alert.Body>
          <Alert.Content>Your session will expire in 15 minutes.</Alert.Content>
        </Alert.Body>
      </>
    ),
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
  render: () => (
    <Alert severity="info">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Content>
          Your session will expire in 15 minutes. Save your work to avoid losing changes.
        </Alert.Content>
      </Alert.Body>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert severity="success">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Title>Payment processed</Alert.Title>
        <Alert.Content>Your order #12345 has been confirmed.</Alert.Content>
      </Alert.Body>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert severity="warning">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Title>Storage almost full</Alert.Title>
        <Alert.Content>You have used 90% of your storage quota.</Alert.Content>
      </Alert.Body>
    </Alert>
  ),
};

export const Error: Story = {
  render: () => (
    <Alert severity="error">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Title>Upload failed</Alert.Title>
        <Alert.Content>The file could not be uploaded. Try again.</Alert.Content>
      </Alert.Body>
    </Alert>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Alert severity="warning">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Title>Update available</Alert.Title>
        <Alert.Content>A new version is available with security fixes.</Alert.Content>
        <Alert.Actions>
          <Alert.Action onClick={() => {}}>Update now</Alert.Action>
        </Alert.Actions>
      </Alert.Body>
    </Alert>
  ),
};

export const Dismissible: Story = {
  render: () => (
    <Alert severity="info">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Content>You can customize notification preferences in Settings.</Alert.Content>
      </Alert.Body>
      <Alert.Close />
    </Alert>
  ),
};
