"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    const id = React.useId();
    
    return (
      <div className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center rounded-full bg-input transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
        <input
          type="checkbox"
          id={id}
          className="peer sr-only"
          ref={ref}
          {...props}
        />
        <span className="pointer-events-none absolute mx-0.5 my-0.5 h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform peer-checked:translate-x-4 peer-checked:bg-background peer-checked:[&+div]:bg-primary" />
        <div className="absolute inset-0 rounded-full transition peer-checked:bg-primary" />
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch } 