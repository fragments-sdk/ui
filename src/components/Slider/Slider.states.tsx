/**
 * State fixtures for Slider, rendered by `pnpm run test:states`.
 *
 * @family:choice
 * @na:empty A slider always holds a value; the minimum is a value, not an empty state.
 * @na:loading A slider moves locally and instantly; a server-backed setting shows pending on its own action.
 */
import { Stack } from "../Stack";
import { Slider } from ".";

const width = { inlineSize: 280 };

export function populated() {
  return (
    <Stack gap="lg" style={width}>
      <Slider label="Volume" defaultValue={40} />
      <Slider
        label="Opacity"
        defaultValue={0.8}
        min={0}
        max={1}
        step={0.05}
        format={{ style: "percent" }}
        locale="en-US"
        showValue
      />
      <Slider
        label="Price"
        defaultValue={[20, 80]}
        getAriaLabel={(index) => (index === 0 ? "Minimum price" : "Maximum price")}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        locale="en-US"
        showValue
      />
      <Slider
        label="Quality"
        defaultValue={80}
        showValue
        helperText="Higher quality makes larger files."
      />
    </Stack>
  );
}

export function error() {
  return (
    <Stack gap="lg" style={width}>
      <Slider
        label="Budget"
        defaultValue={90}
        showValue
        invalid
        errorMessage="The cap for this plan is 75."
      />
      <Slider
        label="Seats"
        defaultValue={2}
        min={1}
        max={20}
        helperText="One per person who signs in."
        invalid
        errorMessage="Keep at least three seats."
      />
    </Stack>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 200 }}>
      <Slider
        label="Minimum severity shown on every pull request comment"
        defaultValue={[1250, 98000]}
        min={0}
        max={100000}
        format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        locale="en-US"
        getAriaLabel={(index) => (index === 0 ? "Minimum" : "Maximum")}
        showValue
        helperText="Long labels wrap; the value keeps its own line width."
      />
    </div>
  );
}

export function lifecycle() {
  return (
    <Stack gap="lg" style={width}>
      <Slider label="Hover me" defaultValue={30} data-states-interact="hover" />
      <Slider label="Focus me" defaultValue={50} data-states-interact="focus" />
      <Slider label="Read-only" defaultValue={60} showValue readOnly />
      <Slider label="Unavailable" defaultValue={30} showValue disabled />
      <Slider label="Small row" size="sm" defaultValue={45} />
      <Slider label="Large row" size="lg" defaultValue={45} />
    </Stack>
  );
}
