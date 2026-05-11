// Semantic color class bundles — reference CSS variables from globals.css.
// Use these in className logic instead of hardcoded hex values.
export const COLORS = {
  primary:      "bg-[var(--color-primary)] text-white",
  primaryLight: "bg-[var(--color-primary-light)] text-[var(--color-primary)]",
  success:      "bg-[var(--color-success-light)] text-[var(--color-success)]",
  danger:       "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
  warning:      "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  purple:       "bg-[var(--color-purple-light)] text-[var(--color-purple)]",
  surface:      "bg-[var(--color-surface)] border-[var(--color-border)]",
  muted:        "bg-[var(--color-surface-muted)]",
} as const;

export type ColorKey = keyof typeof COLORS;
