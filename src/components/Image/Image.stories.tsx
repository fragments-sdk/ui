import type { Meta, StoryObj } from '@storybook/react';
import { Image } from '.';

/**
 * Image is a responsive image component with aspect-ratio control, loading
 * states, and error fallbacks. The src and alt props are required; alt must
 * describe the image content for accessibility.
 */
const SAMPLE_SRC =
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop';

const meta = {
  title: 'Display/Image',
  component: Image,
  tags: ['autodocs', 'canonical'],
  parameters: {
    docs: {
      description: {
        component:
          'Responsive image with aspect-ratio control, loading states, and error fallbacks.',
      },
    },
  },
  argTypes: {
    aspectRatio: {
      control: 'select',
      options: ['1:1', '4:3', '16:9', '21:9', 'auto'],
      description: 'Aspect ratio of the image container',
    },
    objectFit: {
      control: 'select',
      options: ['cover', 'contain', 'fill', 'none'],
      description: 'How the image fits within its container',
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Border radius',
    },
  },
  args: {
    src: SAMPLE_SRC,
    alt: 'Code on a screen',
    width: 300,
  },
} satisfies Meta<typeof Image>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { src: SAMPLE_SRC, alt: 'Code on a screen', width: 300 },
};

export const Square: Story = {
  args: {
    src: SAMPLE_SRC,
    alt: 'Square crop',
    aspectRatio: '1:1',
    width: 200,
  },
};

export const Widescreen: Story = {
  args: {
    src: SAMPLE_SRC,
    alt: 'Widescreen crop',
    aspectRatio: '16:9',
    width: 320,
    rounded: 'md',
  },
};

export const Rounded: Story = {
  args: {
    src: SAMPLE_SRC,
    alt: 'Rounded image',
    aspectRatio: '1:1',
    rounded: 'full',
    width: 120,
    height: 120,
  },
};

export const WithFallback: Story = {
  args: {
    src: 'https://invalid-url.example/image.jpg',
    alt: 'Image that will fail to load',
    width: 200,
    height: 150,
    rounded: 'md',
    fallback: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'var(--fui-color-surface-secondary, #f4f4f5)',
        }}
      >
        <span style={{ color: 'var(--fui-color-text-tertiary, #71717a)' }}>
          No image
        </span>
      </div>
    ),
  },
};
