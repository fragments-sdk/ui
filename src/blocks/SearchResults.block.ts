import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Search Results',
  description: 'List of search results with categories and badges',
  category: 'dashboard',
  components: ['Card', 'Stack', 'Text', 'Badge', 'Button'],
  tags: ['search', 'results', 'list', 'dashboard'],
  code: `
const results = [
  { title: 'Getting Started Guide', category: 'Documentation', description: 'Learn how to set up and configure your project...' },
  { title: 'Button Component', category: 'Components', description: 'A versatile button component with multiple variants...' },
  { title: 'Theming System', category: 'Guides', description: 'Customize colors, typography, and spacing...' },
];

<Card>
  <Card.Header>
    <Stack direction="row" justify="between" align="center">
      <Card.Title>Search Results</Card.Title>
      <Badge>3 results</Badge>
    </Stack>
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      {results.map((result, index) => (
        <Stack key={index} gap="sm" style={{ paddingBottom: index < results.length - 1 ? 'var(--fui-space-4)' : 0, borderBottom: index < results.length - 1 ? '1px solid var(--fui-border-default)' : 'none' }}>
          <Stack direction="row" gap="sm" align="center">
            <Text weight="semibold">{result.title}</Text>
            <Badge variant="outline">{result.category}</Badge>
          </Stack>
          <Text size="sm" color="tertiary">{result.description}</Text>
          <Button variant="ghost" size="sm">View details</Button>
        </Stack>
      ))}
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
