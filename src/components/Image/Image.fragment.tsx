import React from 'react';
import { defineFragment } from '@fragments/core';
import { Image } from '.';

export default defineFragment({
  component: Image,

  meta: {
    name: 'Image',
    description: 'Responsive image component with aspect ratio control, loading states, and error fallbacks. Handles image display with consistent styling.',
    category: 'display',
    status: 'stable',
    tags: ['image', 'media', 'photo', 'picture', 'visual'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Displaying product images in cards or grids',
      'Hero images with specific aspect ratios',
      'User-uploaded content that may fail to load',
      'Thumbnails in lists or galleries',
    ],
    whenNot: [
      'User avatars (use Avatar component)',
      'Icons or symbols (use Icon component)',
      'Background images (use CSS background-image)',
      'SVG illustrations (use inline SVG or Image component)',
    ],
    guidelines: [
      'Always provide meaningful alt text for accessibility',
      'Use appropriate aspect ratios for consistent layouts',
      'Provide fallback content for failed loads',
      'Use objectFit="contain" for logos to preserve aspect ratio',
    ],
    accessibility: [
      'Alt text is required and must describe the image content',
      'Decorative images should have empty alt=""',
      'Avoid text in images; if necessary, describe the text in alt',
      'Ensure sufficient contrast between image and surrounding content',
    ],
  },

  props: {
    src: {
      type: 'string',
      description: 'Image source URL',
      required: true,
    },
    alt: {
      type: 'string',
      description: 'Alt text for accessibility (required)',
      required: true,
    },
    aspectRatio: {
      type: 'enum',
      description: 'Aspect ratio of the image container',
      values: ['1:1', '4:3', '16:9', '21:9', 'auto'],
      default: 'auto',
    },
    objectFit: {
      type: 'enum',
      description: 'How the image fits within its container',
      values: ['cover', 'contain', 'fill', 'none'],
      default: 'cover',
    },
    width: {
      type: 'union',
      description: 'Width of the image container',
    },
    height: {
      type: 'union',
      description: 'Height of the image container',
    },
    rounded: {
      type: 'enum',
      description: 'Border radius',
      values: ['none', 'sm', 'md', 'lg', 'full'],
      default: 'none',
    },
    fallback: {
      type: 'node',
      description: 'Content to show while loading or on error',
    },
  },

  relations: [
    { component: 'Card', relationship: 'child', note: 'Common pattern to use Image at top of product cards' },
    { component: 'Avatar', relationship: 'alternative', note: 'Use Avatar for user profile pictures' },
  ],

  contract: {
    propsSummary: [
      'src: string - image URL (required)',
      'alt: string - accessibility text (required)',
      'aspectRatio: 1:1|4:3|16:9|21:9|auto - container ratio',
      'objectFit: cover|contain|fill|none - image fitting',
      'rounded: none|sm|md|lg|full - border radius',
      'fallback: ReactNode - loading/error content',
    ],
    scenarioTags: [
      'media.image',
      'content.visual',
      'product.display',
    ],
    a11yRules: ['A11Y_IMG_ALT', 'A11Y_IMG_DECORATIVE'],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic image display',
      render: () => (
        <Image
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop"
          alt="Code on a screen"
          width={300}
        />
      ),
    },
    {
      name: 'Aspect Ratios',
      description: 'Different aspect ratio options',
      render: () => (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Image
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=200&fit=crop"
            alt="Square image"
            aspectRatio="1:1"
            width={100}
          />
          <Image
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=150&fit=crop"
            alt="4:3 image"
            aspectRatio="4:3"
            width={120}
          />
          <Image
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=320&h=180&fit=crop"
            alt="16:9 image"
            aspectRatio="16:9"
            width={160}
          />
        </div>
      ),
    },
    {
      name: 'Rounded Corners',
      description: 'Border radius options',
      render: () => (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Image
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop"
            alt="No rounding"
            rounded="none"
            width={80}
            height={80}
          />
          <Image
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop"
            alt="Medium rounding"
            rounded="md"
            width={80}
            height={80}
          />
          <Image
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop"
            alt="Full rounding"
            rounded="full"
            width={80}
            height={80}
          />
        </div>
      ),
    },
    {
      name: 'With Fallback',
      description: 'Fallback content for loading/error states',
      render: () => (
        <Image
          src="https://invalid-url.example/image.jpg"
          alt="Image that will fail"
          width={200}
          height={150}
          rounded="md"
          fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--fui-color-surface-secondary)' }}>
              <span style={{ color: 'var(--fui-color-text-tertiary)' }}>No image</span>
            </div>
          }
        />
      ),
    },
  ],
});
