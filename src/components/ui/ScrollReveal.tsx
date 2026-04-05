import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

import { usePreferLightMobileEffects, usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/lib/cn'

type ScrollRevealProperties = {
  children: ReactNode
  className?: string
  /** Delay in seconds after the element enters the viewport */
  delaySeconds?: number
}

export function ScrollReveal({
  children,
  className,
  delaySeconds = 0,
}: ScrollRevealProperties) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const preferLightMobileEffects = usePreferLightMobileEffects()

  if (prefersReducedMotion || preferLightMobileEffects) {
    return <div className={cn(className)}>{children}</div>
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -8% 0px' }}
      transition={{
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
        delay: delaySeconds,
      }}
    >
      {children}
    </motion.div>
  )
}
