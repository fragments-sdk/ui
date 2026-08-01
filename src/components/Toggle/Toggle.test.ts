import { describe, expect, it } from "vitest";
import { Switch } from "../Switch";
import { Toggle } from "./index";

describe("Toggle compatibility adapter", () => {
  it("preserves strict component identity", () => {
    expect(Toggle).toBe(Switch);
  });
});
