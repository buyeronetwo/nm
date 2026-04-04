import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/cn'

type ShepherdMascotProperties = {
  className?: string
  'aria-hidden'?: boolean
}

/**
 * Дружелючий маскот-овчарка в минималистичном стиле (оригинальная графика).
 */
export function ShepherdMascot({
  className,
  'aria-hidden': ariaHidden = true,
}: ShepherdMascotProperties) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.svg
      className={cn('text-foreground', className)}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              rotate: [0, 5, -5, 0],
              transition: { duration: 0.5 },
            }
      }
    >
      <ellipse cx="60" cy="104" rx="38" ry="8" fill="currentColor" opacity="0.08" />
      <path
        d="M38 52c0-14 11-26 25-28 4-8 14-14 24-14 16 0 28 12 30 28 10 2 18 12 18 24 0 16-12 28-28 28H44c-12 0-22-10-22-22 0-10 6-18 16-20z"
        fill="currentColor"
        opacity="0.88"
      />
      <circle cx="48" cy="58" r="5" fill="var(--color-background)" />
      <circle cx="74" cy="58" r="5" fill="var(--color-background)" />
      <ellipse cx="60" cy="70" rx="8" ry="5" fill="var(--color-accent)" opacity="0.9" />
      <path
        d="M52 78c6 4 14 4 20 0"
        stroke="var(--color-background)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M24 68c-6 10-4 22 6 28M96 68c6 10 4 22-6 28"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M82 88c10 8 18 4 22-4"
        stroke="var(--color-accent)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </motion.svg>
  )
}
