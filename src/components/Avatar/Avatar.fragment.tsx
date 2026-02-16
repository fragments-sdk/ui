import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { Avatar } from '.';
import { Stack } from '../Stack';

export default defineFragment({
  component: Avatar,

  meta: {
    name: 'Avatar',
    description: 'Visual representation of a user or entity',
    category: 'display',
    status: 'stable',
    tags: ['user', 'profile', 'image', 'identity'],
  },

  usage: {
    when: [
      'Displaying user profile pictures',
      'Showing team member lists',
      'Representing entities in lists or cards',
      'User identification in comments or messages',
    ],
    whenNot: [
      'Decorative images (use Image)',
      'Logo display (use Logo component)',
      'Large profile headers (use custom layout)',
    ],
    guidelines: [
      'Always provide alt text or name for accessibility',
      'Use consistent sizes within the same context',
      'Provide fallback initials when image may not load',
      'Use Avatar.Group for multiple avatars in a row',
    ],
    accessibility: [
      'Include meaningful alt text describing the user',
      'Initials should be derived from name for screen readers',
      'Decorative avatars should have empty alt',
    ],
  },

  props: {
    src: {
      type: 'string',
      description: 'Image source URL',
    },
    alt: {
      type: 'string',
      description: 'Alt text for the image',
    },
    name: {
      type: 'string',
      description: 'Full name - used to generate initials',
    },
    initials: {
      type: 'string',
      description: 'Fallback initials (1-2 characters)',
    },
    size: {
      type: 'enum',
      values: ['xs', 'sm', 'md', 'lg', 'xl'],
      default: 'md',
      description: 'Size variant',
    },
    customSize: {
      type: 'string',
      description: 'Custom avatar size (number in px or CSS size string like "2.25rem"), overrides size width/height',
    },
    shape: {
      type: 'enum',
      values: ['circle', 'square'],
      default: 'circle',
      description: 'Shape variant',
    },
    color: {
      type: 'string',
      description: 'Custom background color for fallback avatar',
    },
    imageStyle: {
      type: 'string',
      description: 'Inline style object applied to the underlying image element',
    },
  },

  relations: [
    {
      component: 'Avatar',
      relationship: 'parent',
      note: 'Use Avatar.Group for stacked avatar displays',
    },
  ],

  contract: {
    propsSummary: [
      'src: string - image URL',
      'name: string - used for initials fallback',
      'size: xs|sm|md|lg|xl (default: md)',
      'customSize: number|string - custom size override',
      'imageStyle: CSSProperties - inline image styling',
      'shape: circle|square (default: circle)',
    ],
    scenarioTags: [
      'profile.display',
      'list.user',
      'comment.author',
    ],
    a11yRules: [
      'A11Y_IMG_ALT',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'Default',
      description: 'Avatar with image',
      code: `import { Avatar } from '@/components/Avatar';

<Avatar
  src="https://i.pravatar.cc/150?u=jane"
  alt="Jane Doe"
  name="Jane Doe"
/>`,
      render: () => (
        <Avatar
          src="https://i.pravatar.cc/150?u=jane"
          alt="Jane Doe"
          name="Jane Doe"
        />
      ),
    },
    {
      name: 'With Initials',
      description: 'Fallback when no image is provided',
      code: `import { Avatar } from '@/components/Avatar';

<Avatar name="John Smith" />`,
      render: () => <Avatar name="John Smith" />,
    },
    {
      name: 'Sizes',
      description: 'Available size options',
      code: `import { Avatar } from '@/components/Avatar';
import { Stack } from '@/components/Stack';

<Stack direction="row" gap="sm" align="center" wrap>
  <Avatar name="XS" size="xs" />
  <Avatar name="SM" size="sm" />
  <Avatar name="MD" size="md" />
  <Avatar name="LG" size="lg" />
  <Avatar name="XL" size="xl" />
</Stack>`,
      render: () => (
        <Stack direction="row" gap="sm" align="center" wrap>
          <Avatar name="XS" size="xs" />
          <Avatar name="SM" size="sm" />
          <Avatar name="MD" size="md" />
          <Avatar name="LG" size="lg" />
          <Avatar name="XL" size="xl" />
        </Stack>
      ),
    },
    {
      name: 'Custom Size',
      description: 'Set an exact avatar size',
      code: `import { Avatar } from '@/components/Avatar';

<Avatar name="Conan McNicholl" customSize={36} />`,
      render: () => <Avatar name="Conan McNicholl" customSize={36} />,
    },
    {
      name: 'Square Shape',
      description: 'Square variant for app icons or brands',
      code: `import { Avatar } from '@/components/Avatar';

<Avatar name="App" shape="square" />`,
      render: () => <Avatar name="App" shape="square" />,
    },
    {
      name: 'Group',
      description: 'Multiple avatars stacked together',
      code: `import { Avatar } from '@/components/Avatar';

<Avatar.Group max={3} size="md">
  <Avatar name="Alice Johnson" />
  <Avatar name="Bob Smith" />
  <Avatar name="Carol Williams" />
  <Avatar name="David Brown" />
  <Avatar name="Eve Davis" />
</Avatar.Group>`,
      render: () => (
        <Avatar.Group max={3} size="md">
          <Avatar name="Alice Johnson" />
          <Avatar name="Bob Smith" />
          <Avatar name="Carol Williams" />
          <Avatar name="David Brown" />
          <Avatar name="Eve Davis" />
        </Avatar.Group>
      ),
    },
  ],
});
