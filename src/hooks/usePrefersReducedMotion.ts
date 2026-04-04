import { useEffect, useState } from 'react'

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQueryList.matches)
    }

    updatePreference()
    mediaQueryList.addEventListener('change', updatePreference)
    return () => mediaQueryList.removeEventListener('change', updatePreference)
  }, [])

  return prefersReducedMotion
}
