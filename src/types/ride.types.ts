export type RideStatus = "completed" | "cancelled" | "ongoing";
export type RideFilter = "all" | "completed" | "cancelled";

export const STATUS_COLOR: Record<RideStatus, "success" | "danger" | "accent"> = {
  completed: "success",
  cancelled: "danger",
  ongoing:   "accent",
};
