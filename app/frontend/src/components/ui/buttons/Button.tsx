import React, { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../utils/classNames";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
        outline:
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-indigo-500",
        ghost:
          "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
        link: "bg-transparent text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline focus-visible:ring-indigo-500 p-0 h-auto",
        danger:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        success:
          "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
      },
      size: {
        xs: "text-xs px-2 py-1 h-7",
        sm: "text-sm px-3 py-1.5 h-8",
        md: "text-sm px-4 py-2 h-10",
        lg: "text-base px-5 py-2.5 h-12",
        icon: "h-9 w-9",
      },
      fullWidth: {
        true: "w-full",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "md",
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      rounded,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, fullWidth, rounded, className })
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {isLoading ? "Loading..." : children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

// Export the Button component
export { Button, buttonVariants };
