import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 rounded-2xl border-2 border-primary/20 hover:shadow-xl hover:shadow-primary/40 hover:border-primary/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        destructive:
          "bg-gradient-to-br from-destructive via-destructive/90 to-destructive/80 text-destructive-foreground shadow-lg shadow-destructive/30 rounded-2xl border-2 border-destructive/20 hover:shadow-xl hover:shadow-destructive/40 hover:border-destructive/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        outline:
          "border-2 border-primary/40 bg-background/80 backdrop-blur-sm shadow-md shadow-primary/10 rounded-2xl hover:bg-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 text-primary font-bold",
        secondary:
          "bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80 text-secondary-foreground shadow-lg shadow-secondary/20 rounded-2xl border-2 border-secondary/30 hover:shadow-xl hover:shadow-secondary/30 hover:border-secondary/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        ghost: "rounded-2xl hover:bg-accent/50 hover:text-accent-foreground border-2 border-transparent hover:border-accent/30 hover:shadow-md",
        link: "text-primary underline-offset-4 rounded-xl hover:bg-primary/10 px-2 py-1 border-2 border-transparent hover:border-primary/20",
      },
      size: {
        default: "h-10 px-6 py-2.5 rounded-2xl",
        sm: "h-8 rounded-xl px-4 text-xs",
        lg: "h-12 rounded-3xl px-10 text-base",
        icon: "h-10 w-10 rounded-2xl",
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

