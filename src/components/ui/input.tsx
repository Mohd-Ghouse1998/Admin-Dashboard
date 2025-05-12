import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "bg-white border border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 px-3 py-2 rounded-md shadow-sm text-sm w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
