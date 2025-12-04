import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-forest-600 text-white hover:bg-forest-700 focus-visible:ring-forest-500",
        destructive:
          "bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500",
        outline:
          "border border-charcoal-200 bg-transparent text-charcoal-900 hover:bg-charcoal-50 focus-visible:ring-charcoal-500",
        secondary:
          "bg-charcoal-100 text-charcoal-900 hover:bg-charcoal-200 focus-visible:ring-charcoal-500",
        ghost:
          "text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900 focus-visible:ring-charcoal-500",
        link:
          "text-forest-600 underline-offset-4 hover:underline focus-visible:ring-forest-500",
        premium:
          "bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-elevation-sm hover:shadow-elevation-md focus-visible:ring-gold-500",
        gold:
          "bg-gold-500 text-charcoal-900 hover:bg-gold-600 shadow-elevation-sm hover:shadow-elevation-md focus-visible:ring-gold-500",
        glass:
          "bg-white/80 backdrop-blur-md border border-white/20 text-charcoal-900 hover:bg-white/90 shadow-glass focus-visible:ring-charcoal-500",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
