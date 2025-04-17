import React from "react";
import { cn } from "../../../utils/classNames";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
  padding?: boolean;
  centered?: boolean;
}

/**
 * A responsive container component
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  maxWidth = "lg",
  padding = true,
  centered = true,
}) => {
  const maxWidthClasses = {
    xs: "max-w-xs", // 20rem (320px)
    sm: "max-w-sm", // 24rem (384px)
    md: "max-w-md", // 28rem (448px)
    lg: "max-w-3xl", // 48rem (768px) - Updated from max-w-lg (32rem/512px)
    xl: "max-w-5xl", // 64rem (1024px) - Updated from max-w-xl (36rem/576px)
    "2xl": "max-w-7xl", // 80rem (1280px) - Updated from max-w-2xl (42rem/672px)
    full: "max-w-full",
    none: "",
  };

  return (
    <div
      className={cn(
        maxWidthClasses[maxWidth],
        padding && "px-4 sm:px-6",
        centered && "mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
