import type { ReactNode } from 'react'

import { AmbientBackground } from '@/components/layout/AmbientBackground'
import { cn } from '@/lib/cn'

type AppShellProperties = {
  children: ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProperties) {
  return (
    <div
      className={cn(
        'relative z-0 flex min-h-svh flex-col bg-background text-foreground antialiased',
        className,
      )}
    >
      <AmbientBackground />
      {children}
    </div>
  )
}
