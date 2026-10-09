/**
 * State fixtures for FilterBar, rendered by `pnpm run test:states`.
 *
 * @family:pickers
 * @na:empty A bar holds the filters it is given; with none there is no bar to show.
 * @na:loading Filters render the options they are given; the surface that fetches them shows loading.
 * @na:error A filter's choice cannot be invalid; errors belong to the results it narrows.
 */
import { Select } from "../Select";
import { FilterBar } from ".";

const OWNERS = ["All owners", "Alex Santos", "Grace Miller", "Noah Lee"];
const STAGES = ["Any", "Pilot", "Enterprise", "Expansion"];

function Choice({
  options,
  value,
  interact,
}: {
  options: string[];
  value?: string;
  interact?: string;
}) {
  return (
    <Select size="sm" defaultValue={value ?? options[0]}>
      <Select.Trigger data-states-interact={interact} />
      <Select.Content>
        {options.map((option) => (
          <Select.Item key={option} value={option}>
            {option}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}

function Filters(
  props: Partial<React.ComponentProps<typeof FilterBar>> & { owner?: string; interact?: string }
) {
  const { owner, interact, ...bar } = props;
  return (
    <FilterBar size="sm" onReset={() => {}} doneLabel="Show 14 companies" {...bar}>
      <FilterBar.Item label="Owner">
        <Choice options={OWNERS} value={owner} interact={interact} />
      </FilterBar.Item>
      <FilterBar.Item label="Stage">
        <Choice options={STAGES} />
      </FilterBar.Item>
    </FilterBar>
  );
}

// The filters fit, so they sit on one line, each label before its control.
export function populated() {
  return <Filters />;
}

// Too little room for the line: the filters fold behind one button that counts the active ones.
export function overflow() {
  return (
    <div style={{ inlineSize: 240 }}>
      <Filters activeCount={1} owner="Noah Lee" />
    </div>
  );
}

// A filter on the line takes hover and focus like any Select; folded, the bar is one button.
export function lifecycle() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Filters interact="hover focus" />
      <Filters collapse="always" activeCount={2} />
    </div>
  );
}
