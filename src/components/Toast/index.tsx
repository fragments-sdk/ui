"use client";

import * as React from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { useThemePortalProps } from "../Theme/context";
import styles from "./Toast.module.scss";

// ============================================
// Types
// ============================================

/**
 * Briefly reports what just happened, without blocking the page. The toast is
 * always the raised plane; the tone shows only as the icon's ink.
 * @see https://usefragments.com/components/toast
 */
export type ToastTone = "neutral" | "success" | "warning" | "danger";

/** Where the stack sits. `bottom-end` follows the writing direction. */
export type ToastPosition = "bottom-end" | "bottom-center" | "top-center";

export interface ToastAction {
  /** The verb on the button */
  label: string;
  /** Runs the action; the toast closes after it */
  onClick: () => void;
  /** An undo: the button shows the undo key and Mod+Z runs it while the toast is up,
   * unless focus is in a text field. */
  undo?: boolean;
}

export interface ToastBusy {
  /** Steps finished, for the "N of M" count and the progress line */
  done?: number;
  /** Steps in all. Leave out for work with no known length. */
  total?: number;
  /** Adds a Stop button; the toast closes after it runs */
  onStop?: () => void;
}

export interface ToastContent {
  /** One line on what happened */
  title?: React.ReactNode;
  /** One sentence more, if it helps */
  description?: React.ReactNode;
  /** The outcome. Semantic tones draw an icon in the tone's ink; nothing else changes colour.
   * @default "neutral" */
  tone?: ToastTone;
  /** One verb, drawn as a small ghost button */
  action?: ToastAction;
  /** Work in progress: a spinner, an optional "N of M" count and progress line, and Stop.
   * A busy toast has no timer; update it in place when the work ends. */
  busy?: ToastBusy;
}

export interface ToastInput extends ToastContent {
  /** An explicit id: showing a toast with an id already on screen replaces it in place */
  id?: string;
  /** Milliseconds on screen. Anything under 5000 is raised to 5000; 0 keeps it until dismissed.
   * @default the provider's duration */
  duration?: number;
}

export interface ToastProps
  extends ToastContent, Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Draws the dismiss button */
  onDismiss?: () => void;
}

export interface ToastProviderProps {
  /** Where the stack sits.
   * @default "bottom-end" */
  position?: ToastPosition;
  /** Default milliseconds on screen. Anything under 5000 is raised to 5000; 0 keeps toasts until dismissed.
   * @default 5000 */
  duration?: number;
  children: React.ReactNode;
}

type ToastMessage = React.ReactNode | Omit<ToastInput, "tone">;

export interface ToastPromiseMessages<Value> {
  /** Shown while the promise runs, with a spinner and no timer */
  loading: ToastMessage;
  /** Replaces the loading toast when the promise resolves */
  success: ToastMessage | ((value: Value) => ToastMessage);
  /** Replaces the loading toast when the promise rejects */
  error: ToastMessage | ((error: unknown) => ToastMessage);
}

export interface ToastApi {
  /** Shows a toast and returns its id */
  toast: (input: ToastInput) => string;
  success: (message: ToastMessage, description?: React.ReactNode) => string;
  warning: (message: ToastMessage, description?: React.ReactNode) => string;
  danger: (message: ToastMessage, description?: React.ReactNode) => string;
  /** A busy toast while the promise runs, replaced in place by success or danger */
  promise: <Value>(
    promise: Promise<Value>,
    messages: ToastPromiseMessages<Value>
  ) => Promise<Value>;
  /** Changes a toast in place (a busy count, a finished state) */
  update: (id: string, patch: Partial<ToastInput>) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/** The library floor and default: no toast leaves in under five seconds. */
export const TOAST_DURATION_MS = 5000;
/** At most this many toasts are on screen; the rest wait in order. */
export const TOAST_VISIBLE_MAX = 3;

// ============================================
// Helpers
// ============================================

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

function resolveDuration(value: number | undefined, fallback: number) {
  const duration = value ?? fallback;
  if (duration <= 0) return 0;
  return Math.max(duration, TOAST_DURATION_MS);
}

function isMacLike() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return target.closest("input, textarea, select") != null;
}

/** Toast buttons never take focus from the page on a press; the keyboard still reaches them. */
function keepFocus(event: React.MouseEvent) {
  event.preventDefault();
}

function toInput(message: ToastMessage, description?: React.ReactNode): Omit<ToastInput, "tone"> {
  if (
    message != null &&
    typeof message === "object" &&
    !React.isValidElement(message) &&
    !Array.isArray(message)
  ) {
    return message as Omit<ToastInput, "tone">;
  }
  return { title: message as React.ReactNode, description };
}

// ============================================
// Icons
// ============================================

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function SuccessIcon() {
  return (
    <Glyph>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </Glyph>
  );
}

function DangerIcon() {
  return (
    <Glyph>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </Glyph>
  );
}

function WarningIcon() {
  return (
    <Glyph>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Glyph>
  );
}

function SpinnerIcon() {
  return (
    <Glyph>
      <path d="M21 12a9 9 0 1 1-6.22-8.56" />
    </Glyph>
  );
}

function CloseIcon() {
  return (
    <Glyph>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Glyph>
  );
}

const TONE_ICONS: Record<ToastTone, React.ComponentType | null> = {
  neutral: null,
  success: SuccessIcon,
  warning: WarningIcon,
  danger: DangerIcon,
};

// ============================================
// The toast body (one markup for live and static toasts)
// ============================================

interface ToastBodyProps extends ToastContent {
  live: boolean;
  onAction?: () => void;
  onStop?: () => void;
  onDismiss?: () => void;
}

function ToastBody({
  title,
  description,
  tone = "neutral",
  action,
  busy,
  live,
  onAction,
  onStop,
  onDismiss,
}: ToastBodyProps) {
  const Icon = busy ? SpinnerIcon : TONE_ICONS[tone];
  const Title = live ? BaseToast.Title : "div";
  const Description = live ? BaseToast.Description : "div";
  const hasCount = busy?.total != null && busy.total > 0;
  const done = Math.min(Math.max(busy?.done ?? 0, 0), busy?.total ?? 0);
  const mac = React.useMemo(isMacLike, []);

  return (
    <>
      {Icon && (
        <span className={classes(styles.icon, busy != null && styles.spinner)} data-tone={tone}>
          <Icon />
        </span>
      )}
      <div className={styles.content}>
        {(title != null || hasCount) && (
          <div className={styles.titleRow}>
            {title != null && <Title className={styles.title}>{title}</Title>}
            {hasCount && (
              <span className={styles.count}>
                {done} of {busy!.total}
              </span>
            )}
          </div>
        )}
        {description != null && (
          <Description className={styles.description}>{description}</Description>
        )}
      </div>
      {(action || busy?.onStop) && (
        <div className={styles.actions}>
          {action && (
            <Button
              variant="ghost"
              size="sm"
              data-toast-action=""
              onMouseDown={keepFocus}
              onClick={onAction ?? action.onClick}
            >
              {action.label}
              {action.undo && (
                <kbd className={styles.shortcut} aria-hidden="true">
                  {mac ? "⌘Z" : "Ctrl Z"}
                </kbd>
              )}
            </Button>
          )}
          {busy?.onStop && (
            <Button
              variant="ghost"
              size="sm"
              data-toast-stop=""
              onMouseDown={keepFocus}
              onClick={onStop ?? busy.onStop}
            >
              Stop
            </Button>
          )}
        </div>
      )}
      {onDismiss && (
        <IconButton
          variant="ghost"
          size="sm"
          className={styles.close}
          onMouseDown={keepFocus}
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <CloseIcon />
        </IconButton>
      )}
      {hasCount && (
        <div
          className={styles.progress}
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={0}
          aria-valuemax={busy!.total}
          aria-valuenow={done}
          style={{ "--_toast-progress": `${(done / busy!.total!) * 100}%` } as React.CSSProperties}
        />
      )}
    </>
  );
}

/**
 * One toast drawn in place, for previews and documentation. Live toasts come
 * from `useToast()` inside `Toast.Provider`, which owns timing and stacking.
 */
function ToastRoot({
  title,
  description,
  tone = "neutral",
  action,
  busy,
  onDismiss,
  className,
  ...htmlProps
}: ToastProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      aria-atomic="true"
      {...htmlProps}
      data-tone={tone}
      className={classes(styles.toast, className)}
    >
      <ToastBody
        live={false}
        title={title}
        description={description}
        tone={tone}
        action={action}
        busy={busy}
        onDismiss={onDismiss}
      />
    </div>
  );
}

// ============================================
// Provider, queue and viewport
// ============================================

interface ToastData {
  input: ToastInput;
}

type ManagerOptions = Parameters<ReturnType<typeof BaseToast.useToastManager<ToastData>>["add"]>[0];

const ToastContext = React.createContext<ToastApi | null>(null);

const SWIPE: Record<ToastPosition, Array<"up" | "down" | "left" | "right">> = {
  "bottom-end": ["down", "right"],
  "bottom-center": ["down"],
  "top-center": ["up"],
};

const POSITION_CLASS: Record<ToastPosition, string | undefined> = {
  "bottom-end": styles.bottomEnd,
  "bottom-center": styles.bottomCenter,
  "top-center": styles.topCenter,
};

interface ToastBridgeProps {
  position: ToastPosition;
  duration: number;
  children: React.ReactNode;
}

function ToastBridge({ position, duration, children }: ToastBridgeProps) {
  const manager = BaseToast.useToastManager<ToastData>();
  const { add, close, update: patch } = manager;
  const portalProps = useThemePortalProps();
  const live = React.useRef(new Set<string>());
  const queue = React.useRef<ManagerOptions[]>([]);
  const counter = React.useRef(0);
  const toastsRef = React.useRef(manager.toasts);
  toastsRef.current = manager.toasts;
  const durationRef = React.useRef(duration);
  durationRef.current = duration;

  const toOptions = React.useCallback((input: ToastInput, id: string): ManagerOptions => {
    const tone = input.tone ?? "neutral";
    return {
      id,
      title: input.title,
      description: input.description,
      type: input.busy ? "loading" : tone,
      timeout: resolveDuration(input.duration, durationRef.current),
      priority: tone === "danger" ? "high" : "low",
      data: { input },
    };
  }, []);

  const pump = React.useCallback(() => {
    while (live.current.size < TOAST_VISIBLE_MAX && queue.current.length > 0) {
      const next = queue.current.shift()!;
      live.current.add(next.id!);
      add(next);
    }
  }, [add]);

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = input.id ?? `fui-toast-${++counter.current}`;
      const options = toOptions(input, id);

      if (live.current.has(id)) {
        patch(id, options);
        return id;
      }
      const queued = queue.current.findIndex((item) => item.id === id);
      if (queued >= 0) {
        queue.current[queued] = { ...queue.current[queued], ...options };
        return id;
      }

      queue.current.push({
        ...options,
        onClose: () => {
          live.current.delete(id);
          pump();
        },
      });
      pump();
      return id;
    },
    [patch, pump, toOptions]
  );

  const update = React.useCallback(
    (id: string, next: Partial<ToastInput>) => {
      const queued = queue.current.findIndex((item) => item.id === id);
      if (queued >= 0) {
        const entry = queue.current[queued];
        const input = { ...(entry.data as ToastData).input, ...next };
        queue.current[queued] = { ...entry, ...toOptions(input, id) };
        return;
      }
      patch(id, (prev) => toOptions({ ...(prev.data as ToastData).input, ...next }, id));
    },
    [patch, toOptions]
  );

  const dismiss = React.useCallback(
    (id: string) => {
      const queued = queue.current.findIndex((item) => item.id === id);
      if (queued >= 0) {
        queue.current.splice(queued, 1);
        return;
      }
      close(id);
    },
    [close]
  );

  const dismissAll = React.useCallback(() => {
    queue.current = [];
    close();
  }, [close]);

  const api = React.useMemo<ToastApi>(() => {
    const tone = (value: ToastTone) => (message: ToastMessage, description?: React.ReactNode) =>
      toast({ ...toInput(message, description), tone: value });

    function promise<Value>(running: Promise<Value>, messages: ToastPromiseMessages<Value>) {
      const id = toast({ ...toInput(messages.loading), busy: {} });
      running.then(
        (value) => {
          const message =
            typeof messages.success === "function"
              ? (messages.success as (value: Value) => ToastMessage)(value)
              : messages.success;
          update(id, { ...toInput(message), tone: "success", busy: undefined });
        },
        (error: unknown) => {
          const message =
            typeof messages.error === "function"
              ? (messages.error as (error: unknown) => ToastMessage)(error)
              : messages.error;
          update(id, { ...toInput(message), tone: "danger", busy: undefined });
        }
      );
      return running;
    }

    return {
      toast,
      success: tone("success"),
      warning: tone("warning"),
      danger: tone("danger"),
      promise,
      update,
      dismiss,
      dismissAll,
    };
  }, [dismiss, dismissAll, toast, update]);

  // Mod+Z runs the newest undo on screen, unless focus is in a text field.
  const hasUndo = manager.toasts.some(
    (item) => item.transitionStatus !== "ending" && item.data?.input.action?.undo
  );
  React.useEffect(() => {
    if (!hasUndo) return undefined;
    const mac = isMacLike();
    function onKeyDown(event: KeyboardEvent) {
      const mod = mac ? event.metaKey : event.ctrlKey;
      if (!mod || event.shiftKey || event.altKey || event.key.toLowerCase() !== "z") return;
      if (isEditable(event.target)) return;
      const target = toastsRef.current.find(
        (item) => item.transitionStatus !== "ending" && item.data?.input.action?.undo
      );
      if (!target) return;
      event.preventDefault();
      target.data!.input.action!.onClick();
      close(target.id);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, hasUndo]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <BaseToast.Portal {...portalProps}>
        <BaseToast.Viewport
          className={classes(styles.viewport, POSITION_CLASS[position])}
          data-position={position}
        >
          {manager.toasts.map((item) => {
            const input = item.data?.input ?? {};
            return (
              <BaseToast.Root
                key={item.id}
                toast={item}
                swipeDirection={SWIPE[position]}
                data-tone={input.tone ?? "neutral"}
                className={styles.toast}
              >
                <ToastBody
                  live
                  title={input.title}
                  description={input.description}
                  tone={input.tone}
                  action={input.action}
                  busy={input.busy}
                  onAction={
                    input.action
                      ? () => {
                          input.action!.onClick();
                          close(item.id);
                        }
                      : undefined
                  }
                  onStop={
                    input.busy?.onStop
                      ? () => {
                          input.busy!.onStop!();
                          close(item.id);
                        }
                      : undefined
                  }
                  onDismiss={() => close(item.id)}
                />
              </BaseToast.Root>
            );
          })}
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </ToastContext.Provider>
  );
}

/**
 * Owns the toast stack: five seconds on screen at the least, paused while the
 * pointer or focus is on a toast or the window is in the background, at most
 * three on screen and the rest queued in order.
 */
function ToastProvider({
  position = "bottom-end",
  duration = TOAST_DURATION_MS,
  children,
}: ToastProviderProps) {
  const timeout = resolveDuration(duration, TOAST_DURATION_MS);
  return (
    <BaseToast.Provider timeout={timeout} limit={TOAST_VISIBLE_MAX}>
      <ToastBridge position={position} duration={timeout}>
        {children}
      </ToastBridge>
    </BaseToast.Provider>
  );
}

/** Shows, updates and dismisses toasts. Call it inside `Toast.Provider`. */
export function useToast(): ToastApi {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ============================================
// Export compound component
// ============================================

export const Toast = Object.assign(ToastRoot, {
  Provider: ToastProvider,
});

export { ToastRoot, ToastProvider };
