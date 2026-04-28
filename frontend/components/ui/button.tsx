import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium " +
    "transition-all duration-300 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-bone hover:bg-ink-700 shadow-soft hover:shadow-gold",
        gold:
          "bg-gold-gradient text-ink shadow-gold hover:brightness-110 hover:-translate-y-0.5",
        outline:
          "border border-ink/20 bg-transparent text-ink hover:border-gold hover:text-gold-700",
        ghost:
          "bg-transparent text-ink hover:bg-ink/5",
        link: "bg-transparent text-ink underline-offset-4 hover:underline"
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-md",
        md: "h-11 px-6 text-sm rounded-md tracking-wide",
        lg: "h-14 px-8 text-base rounded-md tracking-luxury-wide uppercase"
      }
    },
    defaultVariants: { variant: "primary", size: "md" }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
