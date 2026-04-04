import { cn } from '@/lib/cn'

type GuideSilhouetteProperties = {
  className?: string
  'aria-hidden'?: boolean
}

/**
 * Минималистичная оригинальная композиция (не персонаж из игры).
 * Замените на финальный арт бренда.
 */
export function GuideSilhouette({
  className,
  'aria-hidden': ariaHidden = true,
}: GuideSilhouetteProperties) {
  return (
    <svg
      className={cn('text-foreground', className)}
      viewBox="0 0 200 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
    >
      <ellipse cx="100" cy="248" rx="72" ry="10" fill="currentColor" opacity="0.08" />
      <path
        d="M100 32c-18 0-32 14-32 32 0 10 4 19 11 25-22 8-38 30-38 56v48h118v-48c0-26-16-48-38-56 7-6 11-15 11-25 0-18-14-32-32-32z"
        fill="currentColor"
        opacity="0.92"
      />
      <rect x="64" y="108" width="72" height="100" rx="8" fill="currentColor" opacity="0.35" />
      <path
        d="M76 118h48v6H76v-6zm0 16h48v6H76v-6zm0 16h32v6H76v-6z"
        fill="var(--color-background)"
        opacity="0.9"
      />
      <circle cx="88" cy="56" r="5" fill="var(--color-accent)" />
      <circle cx="112" cy="56" r="5" fill="var(--color-accent)" />
      <path
        d="M92 72c6 4 14 4 20 0"
        stroke="var(--color-accent)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
