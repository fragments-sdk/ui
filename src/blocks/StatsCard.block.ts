import { defineBlock } from "@usefragments/core";

export default defineBlock({
  name: "Stats Card",
  description: "One metric: label, tabular value, an optional change badge and a neutral icon",
  category: "dashboard",
  components: ["Card", "Stack", "Text", "Badge", "Icon"],
  tags: ["stats", "metrics", "kpi", "dashboard", "card"],
  code: `
<Card>
  <Card.Body>
    <Stack direction="row" justify="between" align="start" gap="md">
      <Stack gap="xs">
        <Text color="tertiary">Total revenue</Text>
        <Text as="p" type="display" tabularNums>$45,231</Text>
        <Badge tone="success">+12.5% from last month</Badge>
      </Stack>
      <Icon icon={CurrencyDollar} size="md" tone="secondary" />
    </Stack>
  </Card.Body>
</Card>
`.trim(),
});
