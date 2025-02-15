import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'wda-inline-flex wda-items-center wda-justify-center wda-whitespace-nowrap wda-rounded-md wda-text-sm wda-font-medium wda-ring-offset-background wda-transition-colors focus-visible:wda-outline-none focus-visible:wda-ring-2 focus-visible:wda-ring-ring focus-visible:wda-ring-offset-2 disabled:wda-pointer-events-none disabled:wda-opacity-50',
  {
    variants: {
      variant: {
        default:
          'wda-bg-primary wda-text-primary-foreground hover:wda-bg-primary/90',
        destructive:
          'wda-bg-destructive wda-text-destructive-foreground hover:wda-bg-destructive/90',
        outline:
          'wda-border wda-border-input wda-bg-background hover:wda-bg-accent hover:wda-text-accent-foreground',
        secondary:
          'wda-bg-secondary wda-text-secondary-foreground hover:wda-bg-secondary/80',
        ghost: 'hover:wda-bg-accent hover:wda-text-accent-foreground',
        link: 'wda-text-primary wda-underline-offset-4 hover:wda-underline',
      },
      size: {
        default: 'wda-h-10 wda-px-4 wda-py-2',
        sm: 'wda-h-9 wda-rounded-md wda-px-3',
        lg: 'wda-h-11 wda-rounded-md wda-px-8',
        icon: 'wda-h-10 wda-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
