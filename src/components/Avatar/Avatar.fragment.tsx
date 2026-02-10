import React from 'react';
import { defineFragment } from '@fragments/core';
import { Avatar } from '.';

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
      render: () => <Avatar name="John Smith" />,
    },
    {
      name: 'Sizes',
      description: 'Available size options',
      render: () => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Avatar name="XS" size="xs" />
          <Avatar name="SM" size="sm" />
          <Avatar name="MD" size="md" />
          <Avatar name="LG" size="lg" />
          <Avatar name="XL" size="xl" />
        </div>
      ),
    },
    {
      name: 'Square Shape',
      description: 'Square variant for app icons or brands',
      render: () => <Avatar name="App" shape="square" />,
    },
    {
      name: 'Group',
      description: 'Multiple avatars stacked together',
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
