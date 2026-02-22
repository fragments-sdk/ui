import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Contact Form',
  description: 'Contact form with name, email, subject and message fields',
  category: 'marketing',
  components: ['Card', 'Stack', 'Input', 'Textarea', 'Button'],
  tags: ['contact', 'form', 'marketing', 'message'],
  code: `
<Card variant="elevated">
  <Card.Header>
    <Card.Title>Contact Us</Card.Title>
    <Card.Description>Send us a message and we'll get back to you soon.</Card.Description>
  </Card.Header>
  <Card.Body>
    <Stack gap="md">
      <Stack direction={{ base: 'column', sm: 'row' }} gap="md">
        <Input label="Name" placeholder="Your name" style={{ flex: 1 }} />
        <Input label="Email" type="email" placeholder="your@email.com" style={{ flex: 1 }} />
      </Stack>
      <Input label="Subject" placeholder="How can we help?" />
      <Textarea label="Message" placeholder="Tell us more about your inquiry..." rows={5} />
      <Button variant="primary" fullWidth>Send Message</Button>
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
