import { Button as HeroButton, ButtonProps } from "@heroui/react";
import { Spinner } from "@heroui/react";
import { ReactNode } from "react";

interface CustomButtonProps extends Omit<ButtonProps, "isLoading"> {
  isLoading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export const Button = ({ isLoading, children, disabled, isDisabled, ...props }: CustomButtonProps) => {
  return (
    <HeroButton isDisabled={disabled || isDisabled || isLoading} {...props}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner size="sm" color="current" />
        </div>
      ) : (
        children
      )}
    </HeroButton>
  );
};
