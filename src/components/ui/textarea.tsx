"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-[120px] w-full rounded-md border bg-transparent px-4 py-3 text-base text-charcoal-900 transition-all duration-200 placeholder:text-charcoal-400 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
  {
    variants: {
      variant: {
        default: "border-charcoal-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20",
        premium: "border-charcoal-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 shadow-elevation-xs",
        error: "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean
  showCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, error, showCount, maxLength, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(
      (props.defaultValue?.toString() || props.value?.toString() || "").length
    )

    return (
      <div className="relative">
        <textarea
          className={cn(
            textareaVariants({ variant: error ? "error" : variant }),
            showCount && "pb-8",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          onChange={(e) => {
            setCharCount(e.target.value.length)
            props.onChange?.(e)
          }}
          {...props}
        />
        {showCount && maxLength && (
          <span className={cn(
            "absolute bottom-2 right-3 text-xs",
            charCount > maxLength * 0.9 ? "text-warning-600" : "text-charcoal-400"
          )}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
