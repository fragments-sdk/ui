import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Card Grid',
  description: 'Responsive grid of cards that reflows based on available space',
  category: 'layout',
  components: ['Grid', 'Card'],
  tags: ['grid', 'cards', 'responsive', 'dashboard', 'tiles'],
  code: `
<Grid columns="auto" minChildWidth="16rem" gap="md">
  {items.map(item => (
    <Card key={item.id}>
      <Card.Header>
        <Card.Title>{item.title}</Card.Title>
        <Card.Description>{item.description}</Card.Description>
      </Card.Header>
      <Card.Body>{item.content}</Card.Body>
    </Card>
  ))}
</Grid>
`.trim(),
});
