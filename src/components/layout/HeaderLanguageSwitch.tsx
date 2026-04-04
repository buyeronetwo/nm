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

export function HeaderLanguageSwitch({ variant, className }: HeaderLanguageSwitchProperties) {
  const { i18n } = useTranslation()
  const containerReference = useRef<HTMLDivElement>(null)
  const [highlightRectangle, setHighlightRectangle] = useState<HighlightRectangle>(emptyHighlight)

  const activeLanguageIndex = supportedLanguages.findIndex((language) =>
    i18n.language.startsWith(language),
  )
  const resolvedActiveIndex = activeLanguageIndex >= 0 ? activeLanguageIndex : 0

  const updateHighlightPosition = useCallback(() => {
    const containerElement = containerReference.current
    if (!containerElement) {
      return
    }
    const buttonNodeList = containerElement.querySelectorAll<HTMLButtonElement>(
      '[data-language-switch-button]',
    )
    const activeButtonElement = buttonNodeList[resolvedActiveIndex]
    if (!activeButtonElement) {
      return
    }
    const containerBounds = containerElement.getBoundingClientRect()
    const buttonBounds = activeButtonElement.getBoundingClientRect()
    setHighlightRectangle({
      leftPixels: buttonBounds.left - containerBounds.left,
      topPixels: buttonBounds.top - containerBounds.top,
      widthPixels: buttonBounds.width,
      heightPixels: buttonBounds.height,
    })
  }, [resolvedActiveIndex])

  useLayoutEffect(() => {
    updateHighlightPosition()
    const containerElement = containerReference.current
    if (!containerElement) {
      return
    }
    const resizeObserver = new ResizeObserver(() => {
      updateHighlightPosition()
    })
    resizeObserver.observe(containerElement)
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
      ref={containerReference}
      data-language-switch-variant={variant}
      className={cn('relative flex rounded-lg border border-border p-0.5', className)}
      role="group"
      aria-label="Language"
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
              'relative z-10 min-w-0 flex-1 rounded-md px-2 py-1 text-xs font-semibold uppercase',
              isActive ? 'text-foreground' : 'text-muted hover:text-foreground',
            )}
          >
            {language}
          </button>
        )
      })}
    </div>
  )
}
