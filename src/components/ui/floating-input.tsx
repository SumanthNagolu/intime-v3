"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { inputVariants } from "./input"
import { type VariantProps } from "class-variance-authority"

interface FloatingInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'placeholder'>,
    VariantProps<typeof inputVariants> {
  label: string
  error?: string
  hint?: string
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, variant, size, label, error, hint, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!props.defaultValue || !!props.value)
    const generatedId = React.useId()
    const inputId = id || generatedId

    const isFloating = isFocused || hasValue

    return (
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            inputVariants({ variant: error ? "error" : variant, size }),
            "peer pt-6 pb-2",
            className
          )}
          ref={ref}
          placeholder=" "
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            setHasValue(!!e.target.value)
            props.onBlur?.(e)
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value)
            props.onChange?.(e)
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "absolute left-4 transition-all duration-200 pointer-events-none",
            "text-charcoal-500 peer-focus:text-forest-600",
            isFloating
              ? "top-2 text-xs font-medium"
              : "top-1/2 -translate-y-1/2 text-base",
            error && "text-error-600 peer-focus:text-error-600"
          )}
        >
          {label}
        </label>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error-600">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-charcoal-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }
