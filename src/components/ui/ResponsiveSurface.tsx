import { cn, Surface } from "@heroui/react";

type ResponsiveSurfaceProps = React.ComponentProps<typeof Surface>;

export function ResponsiveSurface({
  className,
  children,
  ...props
}: ResponsiveSurfaceProps) {
  return (
    <Surface
      {...props}
      className={cn(
        "max-md:px-0 p-4 max-md:shadow-none max-md:rounded-none",
        className,
      )}
    >
      {children}
    </Surface>
  );
}
