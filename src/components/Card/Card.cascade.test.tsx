import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "../../test/utils";
import fixtureStyles from "./Card.consumer-fixture.module.scss";
import { Card } from "./index";

const cardSource = readFileSync(
  resolve(process.cwd(), "src/components/Card/Card.module.scss"),
  "utf8"
);
const fixtureSource = readFileSync(
  resolve(process.cwd(), "src/components/Card/Card.consumer-fixture.module.scss"),
  "utf8"
);

describe("Card cascade contract", () => {
  it("routes root padding through one requested-inset channel", () => {
    expect(cardSource).toContain("--_card-root-requested-inset");
    expect(cardSource).not.toContain("--_card-root-forced-inset");
    expect(cardSource).not.toMatch(/\.padding(?:None|Sm|Md|Lg)\s*\{[^}]*\bpadding:/s);
  });

  it("keeps body padding independent from the root inset", () => {
    expect(cardSource).toContain("--_card-body-inset");
    render(
      <Card variant="soft" padding="lg">
        <Card.Body padding="md">Panel body</Card.Body>
      </Card>
    );

    expect(screen.getByRole("article")).toHaveClass("soft", "paddingLg");
    expect(screen.getByText("Panel body")).toHaveClass("body", "paddingMd");
  });

  it("accepts an unlayered consumer class and an inline override", () => {
    render(
      <Card
        className={fixtureStyles.consumerOverride}
        padding="lg"
        style={{ padding: 31, backgroundColor: "rgb(12, 34, 56)" }}
      >
        Customized
      </Card>
    );

    const card = screen.getByRole("article");
    expect(card).toHaveClass("paddingLg", fixtureStyles.consumerOverride);
    expect(card).toHaveStyle({ padding: "31px", backgroundColor: "rgb(12, 34, 56)" });
    expect(fixtureSource).not.toMatch(/\b\d+px\b/);
    expect(fixtureSource).not.toContain("!important");
    expect(fixtureSource).not.toContain("@layer");
  });
});
