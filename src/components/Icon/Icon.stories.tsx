import type { Meta, StoryObj } from '@storybook/react';
import { Heart, Star, Check, Warning, Info } from '@phosphor-icons/react';
import { Icon } from '.';

/**
 * Icon is a wrapper for icon components with consistent sizing and semantic
 * colors. Pass any icon component (Phosphor, Lucide, etc.) via the required
 * `icon` prop. Icons are decorative by default and should be paired with text
 * for meaning.
 */
const meta = {
  title: 'Display/Icon',
  component: Icon,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Wrapper for icon components with consistent sizing and semantic colors.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Icon size',
    },
    weight: {
      control: 'select',
      options: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'],
      description: 'Optional icon style/weight hint',
    },
    variant: {
      control: 'select',
      options: [
        'default',
        'primary',
        'secondary',
        'tertiary',
        'accent',
        'success',
        'warning',
        'error',
      ],
      description: 'Semantic color variant',
    },
  },
  args: {
    icon: Heart,
    size: 'md',
    weight: 'regular',
    variant: 'default',
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { icon: Heart },
};

export const Large: Story = {
  args: { icon: Star, size: 'xl' },
};

export const Success: Story = {
  args: { icon: Check, variant: 'success' },
};

export const Warning_: Story = {
  name: 'Warning',
  args: { icon: Warning, variant: 'warning' },
};

export const Accent: Story = {
  args: { icon: Info, variant: 'accent', weight: 'fill' },
};
