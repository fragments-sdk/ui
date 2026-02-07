import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Form Layout',
  description: 'Two-column form with full-width fields where needed, using Grid for alignment',
  category: 'forms',
  components: ['Grid', 'Input', 'Textarea', 'Select', 'Button'],
  tags: ['form', 'layout', 'grid', 'inputs', 'settings'],
  code: `
<Grid columns={2} gap="md">
  <Input label="First Name" placeholder="Jane" />
  <Input label="Last Name" placeholder="Doe" />
  <Grid.Item colSpan="full">
    <Input label="Email" type="email" placeholder="jane@example.com" />
  </Grid.Item>
  <Grid.Item colSpan="full">
    <Select label="Role">
      <Select.Item value="admin">Admin</Select.Item>
      <Select.Item value="editor">Editor</Select.Item>
      <Select.Item value="viewer">Viewer</Select.Item>
    </Select>
  </Grid.Item>
  <Grid.Item colSpan="full">
    <Textarea label="Bio" placeholder="Tell us about yourself" />
  </Grid.Item>
  <Grid.Item colSpan="full">
    <Button type="submit" variant="primary">Save</Button>
  </Grid.Item>
</Grid>
`.trim(),
});
