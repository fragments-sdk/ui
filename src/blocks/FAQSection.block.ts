import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'FAQ Section',
  description: 'Frequently asked questions with accordion component',
  category: 'marketing',
  components: ['Card', 'Accordion', 'Text'],
  tags: ['faq', 'questions', 'accordion', 'marketing', 'help'],
  code: `
const faqs = [
  { question: 'How do I get started?', answer: 'Simply install the package via npm and import the components you need. Check our documentation for detailed setup instructions.' },
  { question: 'Is it compatible with my framework?', answer: 'Yes! Our components work with React, Next.js, Remix, and any other React-based framework.' },
  { question: 'Can I customize the styling?', answer: 'Absolutely. All components support custom CSS, CSS variables, and our built-in theming system.' },
  { question: 'Do you offer support?', answer: 'We offer community support through GitHub discussions and premium support for enterprise customers.' },
];

<Card>
  <Card.Header>
    <Card.Title>Frequently Asked Questions</Card.Title>
  </Card.Header>
  <Card.Body>
    <Accordion type="single" collapsible>
      {faqs.map((faq, index) => (
        <Accordion.Item key={index} value={\`item-\${index}\`}>
          <Accordion.Trigger>{faq.question}</Accordion.Trigger>
          <Accordion.Content>
            <Text color="secondary">{faq.answer}</Text>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  </Card.Body>
</Card>
`.trim(),
});
