import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { supportedLanguages, type SupportedLanguage } from '@/i18n'
import { cn } from '@/lib/cn'

type HeaderLanguageSwitchProperties = {
  variant: 'desktop' | 'mobile'
  className?: string
}

type HighlightRectangle = {
  leftPixels: number
  topPixels: number
  widthPixels: number
  heightPixels: number
}

const emptyHighlight: HighlightRectangle = {
  leftPixels: 0,
  topPixels: 0,
  widthPixels: 0,
  heightPixels: 0,
}

/** Отступ подсветки от краёв активной кнопки — «воздух» внутри сегмента */
const highlightInsetPixels = 3

export function HeaderLanguageSwitch({ variant, className }: HeaderLanguageSwitchProperties) {
  const { i18n } = useTranslation()
  const trackReference = useRef<HTMLDivElement>(null)
  const [highlightRectangle, setHighlightRectangle] = useState<HighlightRectangle>(emptyHighlight)

  const activeLanguageIndex = supportedLanguages.findIndex((language) =>
    i18n.language.startsWith(language),
  )
  const resolvedActiveIndex = activeLanguageIndex >= 0 ? activeLanguageIndex : 0

  const updateHighlightPosition = useCallback(() => {
    const trackElement = trackReference.current
    if (!trackElement) {
      return
    }
    const buttonNodeList = trackElement.querySelectorAll<HTMLButtonElement>(
      '[data-language-switch-button]',
    )
    const activeButtonElement = buttonNodeList[resolvedActiveIndex]
    if (!activeButtonElement) {
      return
    }
    const trackBounds = trackElement.getBoundingClientRect()
    const buttonBounds = activeButtonElement.getBoundingClientRect()

    const leftRelativePixels = buttonBounds.left - trackBounds.left + highlightInsetPixels
    const topRelativePixels = buttonBounds.top - trackBounds.top + highlightInsetPixels
    const widthPixels = Math.max(
      0,
      buttonBounds.width - highlightInsetPixels * 2,
    )
    const heightPixels = Math.max(
      0,
      buttonBounds.height - highlightInsetPixels * 2,
    )

    setHighlightRectangle({
      leftPixels: Math.round(leftRelativePixels),
      topPixels: Math.round(topRelativePixels),
      widthPixels: Math.round(widthPixels),
      heightPixels: Math.round(heightPixels),
    })
  }, [resolvedActiveIndex])

  useLayoutEffect(() => {
    updateHighlightPosition()
    const trackElement = trackReference.current
    if (!trackElement) {
      return
    }
    const resizeObserver = new ResizeObserver(() => {
      updateHighlightPosition()
    })
    resizeObserver.observe(trackElement)
    window.addEventListener('resize', updateHighlightPosition)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateHighlightPosition)
    }
  }, [updateHighlightPosition, i18n.language])

  function handleSelectLanguage(language: SupportedLanguage) {
    void i18n.changeLanguage(language)
  }

  return (
    <div
      data-language-switch-variant={variant}
      className={cn('rounded-lg border border-border p-1', className)}
      role="group"
      aria-label="Language"
    >
      <div
        ref={trackReference}
        className="relative flex min-h-8 items-stretch gap-0.5 sm:gap-1"
      >
        <motion.div
          className="pointer-events-none absolute z-0 rounded-md bg-white/10 shadow-sm shadow-black/15"
          initial={false}
          animate={{
            left: highlightRectangle.leftPixels,
            top: highlightRectangle.topPixels,
            width: highlightRectangle.widthPixels,
            height: highlightRectangle.heightPixels,
          }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          aria-hidden
        />
        {supportedLanguages.map((language) => {
          const isActive = i18n.language.startsWith(language)
          return (
            <button
              key={language}
              type="button"
              data-language-switch-button
              onClick={() => handleSelectLanguage(language)}
              className={cn(
                'relative z-10 flex min-h-8 min-w-0 flex-1 items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wide',
                isActive ? 'text-foreground' : 'text-muted hover:text-foreground',
              )}
            >
              {language}
            </button>
          )
        })}
      </div>
    </div>
  )
}
