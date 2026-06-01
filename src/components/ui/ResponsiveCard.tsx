import { Card, cn } from "@heroui/react";

type ResponsiveCardProps = React.ComponentProps<typeof Card>;

export function ResponsiveCard({
  className,
  children,
  ...props
}: ResponsiveCardProps) {
  return (
    <Card
      {...props}
      className={cn(
        "max-md:border-0 max-md:shadow-none max-md:rounded-none",
        className,
      )}
    >
      {children}
    </Card>
  );
}
