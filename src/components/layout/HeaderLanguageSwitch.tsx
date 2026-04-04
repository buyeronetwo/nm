import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { supportedLanguages, type SupportedLanguage } from '@/i18n'
import { cn } from '@/lib/cn'

type HeaderLanguageSwitchProperties = {
  variant: 'desktop' | 'mobile'
  className?: string
}

export function HeaderLanguageSwitch({ variant, className }: HeaderLanguageSwitchProperties) {
  const { i18n } = useTranslation()
  const activePillLayoutIdentifier =
    variant === 'desktop' ? 'header-lang-pill-desktop' : 'header-lang-pill-mobile'

  function handleSelectLanguage(language: SupportedLanguage) {
    void i18n.changeLanguage(language)
  }

  return (
    <div
      className={cn('flex rounded-lg border border-border p-0.5', className)}
      role="group"
      aria-label="Language"
    >
      {supportedLanguages.map((language) => {
        const isActive = i18n.language.startsWith(language)
        return (
          <button
            key={language}
            type="button"
            onClick={() => handleSelectLanguage(language)}
            className={cn(
              'relative rounded-md px-2 py-1 text-xs font-semibold uppercase',
              isActive ? 'text-foreground' : 'text-muted hover:text-foreground',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId={activePillLayoutIdentifier}
                className="absolute inset-0 z-0 rounded-md bg-white/10 shadow-sm shadow-black/20"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10">{language}</span>
          </button>
        )
      })}
    </div>
  )
}
