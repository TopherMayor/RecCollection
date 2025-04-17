import React from "react";
import { Container } from "../ui";

type ContainerWidth =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "full"
  | "none";
type ContainerPadding = boolean;

interface ResponsiveContainerProps {
  children: React.ReactNode;
  width?: ContainerWidth;
  padding?: ContainerPadding;
  className?: string;
  as?: React.ElementType;
}

/**
 * A responsive container component that adapts to different screen sizes
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  width = "xl", // Changed from "lg" to "xl" for better desktop experience
  padding = true,
  className = "",
  as: Component = "div",
}) => {
  // If Component is not 'div', we need to wrap the Container
  if (Component !== "div") {
    return (
      <Component className={className}>
        <Container maxWidth={width} padding={padding}>
          {children}
        </Container>
      </Component>
    );
  }

  // Otherwise, use Container directly
  return (
    <Container maxWidth={width} padding={padding} className={className}>
      {children}
    </Container>
  );
};

export default ResponsiveContainer;
