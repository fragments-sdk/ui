/**
 * State fixtures for the ActivityFeed block, rendered by `pnpm run test:states`.
 *
 * @family:blocks
 * @na:lifecycle The feed holds no lifecycle of its own beyond Show more, which overflow covers.
 */
import { ActivityFeed, type ActivityFeedItem } from "./ActivityFeed";

const people = [
  "Alice Chen",
  "Bob Smith",
  "Carol Davis",
  "Dan Wilson",
  "Eve Moreno",
  "Farah Iqbal",
];
const actions = [
  "created a new project",
  "commented on your post",
  "shared a document",
  "completed a task",
  "approved the contract",
  "merged pull request 412",
];

const items: ActivityFeedItem[] = people.map((user, index) => ({
  id: String(index + 1),
  user,
  action: actions[index] ?? "updated a file",
  time: `${(index + 1) * 7} minutes ago`,
  dateTime: `2026-10-03T09:${String(59 - (index + 1) * 7).padStart(2, "0")}`,
}));

export function populated() {
  return <ActivityFeed items={items.slice(0, 4)} />;
}

export function empty() {
  return <ActivityFeed items={[]} />;
}

export function loading() {
  return <ActivityFeed items={[]} loading />;
}

export function error() {
  return <ActivityFeed items={[]} error="Activity didn’t load." onRetry={() => undefined} />;
}

export function overflow() {
  return (
    <ActivityFeed
      items={[
        {
          id: "long",
          user: "Maximiliana Featherstonehaugh-Worthington",
          action:
            "renamed the canonical component list for the design system contract across every repository",
          time: "just now",
        },
        ...items,
      ]}
    />
  );
}
