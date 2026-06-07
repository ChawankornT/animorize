"use client";

import { cn } from "@/lib/utils/cn";
import { buttonVariants, type ButtonVariant, type ButtonSize } from "./button-variants";

export { buttonVariants };

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        "disabled:opacity-50 disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}
