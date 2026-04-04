import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type PrimaryButtonProperties = {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'outline'
} & ButtonHTMLAttributes<HTMLButtonElement>

export function PrimaryButton({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...rest
}: PrimaryButtonProperties) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        variant === 'primary' &&
          'bg-accent text-accent-foreground hover:bg-accent-hover',
        variant === 'outline' &&
          'border border-border bg-transparent text-foreground hover:border-accent hover:text-accent',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
