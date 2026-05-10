import { Tooltip, TooltipTrigger } from "@heroui/react";

export function dateParser({ getValue }: { getValue: any }) {
  const dateValue = getValue();
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  // Format the date part (e.g., "Apr 23, 2026")
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  // Format the time part (e.g., "07:05 PM")
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Tooltip delay={0}>
      <TooltipTrigger>{datePart}</TooltipTrigger>
      <Tooltip.Content showArrow offset={12}>
        <Tooltip.Arrow />
        {datePart} at {timePart}
      </Tooltip.Content>
    </Tooltip>
  );
}
