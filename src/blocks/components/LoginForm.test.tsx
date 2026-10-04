import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, userEvent } from "../../test/utils";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("renders the secondary actions as real links", () => {
    render(<LoginForm forgotPasswordHref="/reset" signUpHref="/join" />);

    const forgot = screen.getByRole("link", { name: "Forgot password?" });
    const signUp = screen.getByRole("link", { name: "Sign up" });

    expect(forgot.tagName).toBe("A");
    expect(forgot).toHaveAttribute("href", "/reset");
    expect(signUp.tagName).toBe("A");
    expect(signUp).toHaveAttribute("href", "/join");
  });

  it("gives both links a placeholder href by default", () => {
    render(<LoginForm />);

    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "#");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "#");
  });

  it("reaches both links with Tab, in reading order", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.tab(); // email
    await user.tab(); // password
    await user.tab();
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveFocus();
    await user.tab(); // submit
    expect(screen.getByRole("button", { name: "Sign in" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveFocus();
  });

  it("titles the card in sentence case", () => {
    render(<LoginForm />);
    expect(screen.getAllByText("Sign in").length).toBeGreaterThan(0);
    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
  });

  it("submits what was typed, with autocomplete hints on both fields", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    const email = screen.getByLabelText(/Email/);
    const password = screen.getByLabelText(/Password/);
    expect(email).toHaveAttribute("autocomplete", "email");
    expect(password).toHaveAttribute("autocomplete", "current-password");

    await user.type(email, "a@b.co");
    await user.type(password, "hunter22");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.co", password: "hunter22" });
  });

  it("holds the submit while pending and keeps the fields enabled", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} pending />);

    const submit = screen.getByRole("button", { name: /Signing in/ });
    expect(submit).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText(/Email/)).not.toBeDisabled();
    expect(screen.getByLabelText(/Password/)).not.toBeDisabled();

    await user.click(submit);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a form error in a danger alert", () => {
    render(<LoginForm error="That email and password don’t match." />);
    expect(screen.getByText("That email and password don’t match.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("marks a field invalid with its own message", () => {
    render(<LoginForm emailError="Enter an email address" />);
    const email = screen.getByLabelText(/Email/);
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Enter an email address")).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).not.toHaveAttribute("aria-invalid", "true");
  });

  it("forwards its ref to the form", () => {
    const ref = React.createRef<HTMLFormElement>();
    render(<LoginForm ref={ref} />);
    expect(ref.current?.tagName).toBe("FORM");
  });
});
