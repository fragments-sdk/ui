/**
 * State fixtures for the LoginForm block, rendered by `pnpm run test:states`.
 *
 * @family:blocks
 * @na:empty The form starts empty; populated is that first paint.
 * @na:loading A sign-in has nothing to load; pending submit is in lifecycle.
 * @na:overflow The copy is fixed and short; the fields scroll their own text.
 */
import { LoginForm } from "./LoginForm";

export function populated() {
  return <LoginForm forgotPasswordHref="/reset" signUpHref="/join" />;
}

export function error() {
  return <LoginForm error="That email and password don’t match." />;
}

export function errorFields() {
  return <LoginForm emailError="Enter an email address" passwordError="Enter your password" />;
}

export function lifecycle() {
  return <LoginForm pending />;
}
