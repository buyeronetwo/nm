import { useEffect, useState } from 'react'

const mobileLightMediaQuery = '(max-width: 767px)'

function readMobileLightPreference(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return window.matchMedia(mobileLightMediaQuery).matches
}

/**
 * Узкие экраны: меньше тяжёлых эффектов (видео в hero, лишние анимации),
 * чтобы снизить нагрузку на GPU и батарею.
 */
export function usePreferLightMobileEffects(): boolean {
  const [preferLight, setPreferLight] = useState(readMobileLightPreference)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mobileLightMediaQuery)
    const updatePreference = () => {
      setPreferLight(mediaQueryList.matches)
    }
    updatePreference()
    mediaQueryList.addEventListener('change', updatePreference)
    return () => mediaQueryList.removeEventListener('change', updatePreference)
  }, [])

  return preferLight
}
