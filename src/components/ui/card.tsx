import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-sm border border-charcoal-200 bg-white text-charcoal-900 shadow-elevation-xs',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight font-heading',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-charcoal-500 font-body', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Technical header component for precision look
const CardBracket = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { label?: string }
>(({ className, label, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between border-b border-charcoal-100 bg-charcoal-50/50 px-4 py-1.5',
      className
    )}
    {...props}
  >
    {label && (
      <span className="font-mono text-[10px] uppercase tracking-widest text-charcoal-400">
        {label}
      </span>
    )}
    <div className="flex space-x-1">
      <div className="h-1 w-1 bg-charcoal-300 rounded-full" />
      <div className="h-1 w-1 bg-charcoal-200 rounded-full" />
    </div>
  </div>
))
CardBracket.displayName = 'CardBracket'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardBracket }
