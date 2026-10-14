"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const Container = React.forwardRef<HTMLElement, ContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main
          id="main-content"
          ref={ref}
          className={cn(
            "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
            className
          )}
          {...props}
        >
          {children}
        </main>
      </>
    );
  }
);
Container.displayName = "Container";

export { Container };
