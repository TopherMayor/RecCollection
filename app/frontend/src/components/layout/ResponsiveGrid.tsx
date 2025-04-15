import React from "react";
import { Grid } from "../ui";

type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type GridGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    default: GridColumns;
    sm?: GridColumns;
    md?: GridColumns;
    lg?: GridColumns;
    xl?: GridColumns;
  };
  gap?: GridGap;
  className?: string;
}

/**
 * A responsive grid component that adapts to different screen sizes
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = "md",
  className = "",
}) => {
  // Convert the columns format to match the Grid component
  const gridCols = {
    xs: columns.default,
    sm: columns.sm,
    md: columns.md,
    lg: columns.lg,
    xl: columns.xl,
  };

  return (
    <Grid cols={gridCols} gap={gap} className={className}>
      {children}
    </Grid>
  );
};

export default ResponsiveGrid;
