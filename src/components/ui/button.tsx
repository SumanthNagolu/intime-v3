import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium uppercase tracking-wider transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-hublot-900 text-white hover:bg-hublot-800 hover:-translate-y-0.5 hover:shadow-elevation-md focus-visible:ring-hublot-500",
        destructive:
          "bg-error-600 text-white hover:bg-error-700 hover:-translate-y-0.5 focus-visible:ring-error-500",
        outline:
          "border-2 border-hublot-900 bg-transparent text-hublot-900 hover:bg-hublot-900 hover:text-white focus-visible:ring-hublot-500",
        secondary:
          "bg-charcoal-100 text-charcoal-900 hover:bg-charcoal-200 focus-visible:ring-charcoal-500",
        ghost:
          "text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900 focus-visible:ring-charcoal-500",
        link:
          "text-hublot-900 underline-offset-4 hover:underline focus-visible:ring-hublot-500",
        premium:
          "bg-gradient-to-r from-gold-500 to-gold-400 text-white hover:from-gold-400 hover:to-gold-500 shadow-gold-glow hover:shadow-gold-glow-lg hover:-translate-y-0.5 focus-visible:ring-gold-500",
        gold:
          "bg-gold-500 text-white hover:bg-gold-400 shadow-gold-glow hover:shadow-gold-glow-lg hover:-translate-y-0.5 focus-visible:ring-gold-500",
        glass:
          "bg-white/90 backdrop-blur-md border border-black/10 text-charcoal-900 hover:bg-white hover:-translate-y-0.5 shadow-glass focus-visible:ring-charcoal-500",
      },
      size: {
        default: "h-11 px-6 py-2",
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

    // When using asChild, Slot expects exactly one child element
    // We can't include the loading spinner as a sibling when asChild is true
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || loading}
          aria-busy={loading}
          aria-disabled={disabled || loading}
          {...props}
        >
          {children}
        </Comp>
      )
    }

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
