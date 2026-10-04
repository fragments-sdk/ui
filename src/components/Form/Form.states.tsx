/**
 * State fixtures for Form, rendered by `pnpm run test:states`.
 *
 * @family:text-fields
 * @na:empty A form exists to hold fields; it always has some.
 */
import * as React from "react";
import { Button } from "../Button";
import { Field } from "../Field";
import { Input } from "../Input";
import { Form } from ".";
import { find, oncePerHost, recorder } from "../../test/recipe-checks";
import { TokenChecks, waitUntil, type Check } from "../../test/token-probe";

function Profile(props: { pending?: boolean; errors?: Record<string, string> }) {
  return (
    <Form pending={props.pending} errors={props.errors} aria-label="Profile">
      <Field name="name">
        <Field.Label>Display name</Field.Label>
        <Input defaultValue="Ada Lovelace" />
      </Field>
      <Field name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" defaultValue="ada@example.com" />
        <Field.Error />
      </Field>
      <Form.Actions>
        <Button variant="soft">Cancel</Button>
        <Button type="submit" variant="solid" pending={props.pending}>
          Save
        </Button>
      </Form.Actions>
    </Form>
  );
}

export function populated() {
  return <Profile />;
}

export function loading() {
  return <Profile pending />;
}

export function error() {
  return <Profile errors={{ email: "That email is already on another account." }} />;
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 240 }}>
      <Profile
        errors={{ email: "That email is already on another account in this organisation." }}
      />
    </div>
  );
}

const TAKEN = "That email is already on another account.";

/** Save: the form locks while the submit is in flight, then the server's answer lands. */
function SubmitsThenFails() {
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  return (
    <Form
      aria-label="Profile"
      pending={pending}
      errors={errors}
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        window.setTimeout(() => {
          setPending(false);
          setErrors({ email: TAKEN });
        }, 300);
      }}
    >
      <Field name="email">
        <Field.Label>Email</Field.Label>
        <Input type="email" defaultValue="ada@example.com" />
        <Field.Error />
      </Field>
      <Form.Actions>
        <Button type="submit" variant="solid" pending={pending}>
          Save
        </Button>
      </Form.Actions>
    </Form>
  );
}

const checkLifecycle = oncePerHost(async (host: HTMLElement): Promise<Check[]> => {
  const { checks, add } = recorder();
  const form = find<HTMLFormElement>(host, "form");
  const input = find<HTMLInputElement>(host, "input");
  find<HTMLButtonElement>(host, 'button[type="submit"]').click();
  await waitUntil(() => form.getAttribute("aria-busy") === "true", 3000);
  add(
    "The form is busy while the submit is in flight",
    form.getAttribute("aria-busy") ?? "",
    form.getAttribute("aria-busy") === "true"
  );
  // The lock is the disabled fieldset around the fields: the input matches `:disabled` without
  // carrying the attribute itself, so its `disabled` property stays false.
  const locked = () => input.matches(":disabled");
  add("The fields lock while it is in flight", String(locked()), locked());
  await waitUntil(() => host.querySelector('[role="alert"]') !== null, 3000);
  const alert = host.querySelector<HTMLElement>('[role="alert"]');
  add(
    "The server's words land on the field",
    alert?.textContent ?? "none",
    alert?.textContent === TAKEN
  );
  add(
    "The words carry the danger icon",
    String(Boolean(alert?.querySelector("svg"))),
    Boolean(alert?.querySelector("svg"))
  );
  add(
    "The field is invalid",
    input.getAttribute("aria-invalid") ?? "",
    input.getAttribute("aria-invalid") === "true"
  );
  const described = (input.getAttribute("aria-describedby") ?? "").split(/\s+/);
  add(
    "The field names the words",
    described.join(" ") || "none",
    Boolean(alert?.id) && described.includes(alert!.id)
  );
  add("The fields unlock when it settles", String(locked()), !locked());
  return checks;
});

export function lifecycle() {
  return (
    <TokenChecks title="Save, then the server answers" check={checkLifecycle}>
      <SubmitsThenFails />
    </TokenChecks>
  );
}
