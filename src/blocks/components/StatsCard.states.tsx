/**
 * State fixtures for the StatsCard block, rendered by `pnpm run test:states`.
 *
 * @family:blocks
 * @na:error A metric that failed to load is a missing value, which empty covers with an em dash.
 * @na:lifecycle The card holds no state; it shows what it is given.
 */
import { CurrencyDollar } from "@phosphor-icons/react";
import { StatsCard } from "./StatsCard";

export function populated() {
  return (
    <StatsCard
      title="Total revenue"
      value="$45,231"
      change="+12.5% from last month"
      changeTone="success"
      icon={CurrencyDollar}
    />
  );
}

export function populatedNeutral() {
  return <StatsCard title="Open findings" value={128} change="No change" />;
}

export function populatedDanger() {
  return <StatsCard title="Failed checks" value={7} change="+3 this week" changeTone="danger" />;
}

export function empty() {
  return <StatsCard title="Active users" value={null} icon={CurrencyDollar} />;
}

export function loading() {
  return <StatsCard title="Total revenue" loading icon={CurrencyDollar} />;
}

export function overflow() {
  return (
    <StatsCard
      title="Average time from first commit to merged pull request across every connected repository"
      value="1,234,567,890"
      change="+0.0001% compared with the same period in the previous financial year"
      changeTone="success"
      icon={CurrencyDollar}
    />
  );
}
