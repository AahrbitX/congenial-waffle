"use client";

import React from "react";
import clsx from "clsx";
import { Label } from "@heroui/react";

type RadioOption = {
  label: string;
  value: string;
};

interface CustomRadioGroupProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: RadioOption[];
  name?: string;
  className?: string;
  columns?: string;
}

function CustomRadioGroup(props: CustomRadioGroupProps) {
  const {
    label,
    value,
    onValueChange,
    options,
    name,
    className,
    columns = "grid-cols-2 md:grid-cols-4",
  } = props;

  return (
    <div className={clsx("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      <div className={clsx("flex items-center justify-start gap-2", columns)}>
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              name={name}
              onClick={() => onValueChange(option.value)}
              className={clsx(
                "rounded-full border px-3 py-1 text-sm font-medium transition-all",
                "hover:border-accent hover:text-accent",
                "focus:outline-none focus:ring-2 focus:ring-accent/30",
                selected
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-default-200 bg-surface text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CustomRadioGroup;
