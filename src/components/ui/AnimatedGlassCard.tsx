import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

import { usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/lib/cn'

type AnimatedGlassCardProperties = {
  children: ReactNode
  /** Delay for inner content entrance (seconds) */
  delaySeconds?: number
  className?: string
  innerClassName?: string
}

export function AnimatedGlassCard({
  children,
  delaySeconds = 0,
  className,
  innerClassName,
}: AnimatedGlassCardProperties) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div className={cn('relative rounded-2xl p-px', className)}>
      {!prefersReducedMotion ? (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          aria-hidden
        >
          <div className="card-border-glow" />
        </div>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl border border-white/15"
          aria-hidden
        />
      )}
      <motion.div
        className={cn(
          'relative rounded-2xl bg-card/88 text-card-foreground shadow-lg shadow-black/35 backdrop-blur-xl',
          innerClassName,
        )}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 0.5,
          delay: delaySeconds,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={
          prefersReducedMotion
            ? undefined
            : { y: -4, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }
        }
      >
        {children}
      </motion.div>
    </div>
  )
}
