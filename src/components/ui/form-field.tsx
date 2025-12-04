import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

interface FormFieldProps {
  children: React.ReactNode
  label?: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
}

export function FormField({
  children,
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
}: FormFieldProps) {
  const generatedId = React.useId()
  const id = htmlFor || generatedId

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-charcoal-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </Label>
      )}

      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id,
            "aria-invalid": !!error,
            "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
          })
        : children}

      {error && (
        <p id={`${id}-error`} className="text-sm text-error-600 flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-charcoal-500">
          {hint}
        </p>
      )}
    </div>
  )
}
