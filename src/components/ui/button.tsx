import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-subheading font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-500/20 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary - Forest Green (Main CTA)
        default:
          "bg-forest-500 text-white shadow-elevation-sm hover:bg-forest-600 hover:shadow-elevation-md hover:-translate-y-0.5 active:translate-y-0 rounded-md",

        // Gold Accent (Premium CTA)
        gold:
          "bg-gradient-gold text-charcoal-900 shadow-elevation-md hover:shadow-elevation-lg hover:-translate-y-0.5 active:translate-y-0 rounded-md border border-gold-600/20",

        // Premium (Gradient with glow)
        premium:
          "bg-gradient-premium text-white shadow-premium hover:shadow-premium-lg hover:-translate-y-1 active:translate-y-0 rounded-md relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700",

        // Secondary - Outlined Forest
        secondary:
          "bg-white text-forest-600 border-2 border-forest-500 hover:bg-forest-50 hover:border-forest-600 shadow-elevation-sm rounded-md",

        // Outline - Neutral
        outline:
          "border-2 border-charcoal-300 bg-white text-charcoal-800 hover:bg-charcoal-50 hover:border-charcoal-400 shadow-elevation-xs rounded-md",

        // Ghost - Minimal
        ghost:
          "text-charcoal-700 hover:bg-charcoal-100 hover:text-charcoal-900 rounded-md",

        // Ghost Gold
        "ghost-gold":
          "text-gold-600 hover:bg-gold-50 hover:text-gold-700 rounded-md",

        // Destructive
        destructive:
          "bg-error-500 text-white shadow-elevation-sm hover:bg-error-600 hover:shadow-elevation-md hover:-translate-y-0.5 active:translate-y-0 rounded-md",

        // Link
        link:
          "text-forest-600 underline-offset-4 hover:underline hover:text-forest-700",

        // Glass Effect
        glass:
          "glass hover:glass-strong shadow-glass text-charcoal-800 hover:shadow-elevation-md hover:-translate-y-0.5 rounded-lg",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
        xl: "h-16 px-12 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-13 w-13",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
