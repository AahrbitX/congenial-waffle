// Semantic color class bundles — reference CSS variables from globals.css.
// Use these in className logic instead of hardcoded hex values.
export const COLORS = {
  primary: "bg-accent text-white",
  success: "bg-success text-white",
  danger: "bg-danger text-white",
  warning: "bg-warning text-white",
  purple: "bg-purple-500 text-white",
} as const;

export type ColorKey = keyof typeof COLORS;
