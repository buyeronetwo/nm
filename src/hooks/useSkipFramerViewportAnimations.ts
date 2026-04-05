import { usePreferLightMobileEffects } from './usePreferLightMobileEffects'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** Не гонять entrance-анимации framer на мобильных и при reduced motion. */
export function useSkipFramerViewportAnimations(): boolean {
  const prefersReducedMotion = usePrefersReducedMotion()
  const preferLightMobileEffects = usePreferLightMobileEffects()
  return prefersReducedMotion || preferLightMobileEffects
}
