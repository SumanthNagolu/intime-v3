import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-sm border bg-white text-charcoal-900 transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-charcoal-400 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-charcoal-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20",
        premium: "border-charcoal-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 shadow-elevation-xs",
        ghost: "border-transparent bg-charcoal-50 focus:bg-white focus:border-gold-500",
        error: "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-500/20 text-error-700",
        success: "border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-500/20",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-4 text-base",
        lg: "h-13 px-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, success, leftIcon, rightIcon, ...props }, ref) => {
    // Auto-select variant based on state
    const computedVariant = error ? "error" : success ? "success" : variant

    if (leftIcon || rightIcon) {
      return (
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              inputVariants({ variant: computedVariant, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
              {rightIcon}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        className={cn(inputVariants({ variant: computedVariant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
