export const dateParser = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);

  const datePart = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const timePart = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} • ${timePart}`;
};
