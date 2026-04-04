import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { supportedLanguages, type SupportedLanguage } from '@/i18n'
import { cn } from '@/lib/cn'

const navigationAnchors = [
  { href: '#why', labelKey: 'nav.why' },
  { href: '#models', labelKey: 'nav.models' },
  { href: '#about', labelKey: 'nav.about' },
  { href: '#start', labelKey: 'nav.start' },
  { href: '#faq', labelKey: 'nav.faq' },
  { href: '#contact', labelKey: 'nav.contact' },
] as const

export function SiteHeader() {
  const { t, i18n } = useTranslation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  function closeMobileMenu() {
    setIsMobileMenuOpen(false)
  }

  function scrollToContact() {
    closeMobileMenu()
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  function changeLanguage(language: SupportedLanguage) {
    void i18n.changeLanguage(language)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-header-bg backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a
          href="#hero"
          className="text-base font-semibold tracking-tight text-foreground"
          onClick={closeMobileMenu}
        >
          {t('brand.name')}
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t('nav.mainNav')}>
          {navigationAnchors.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-sm text-muted hover:text-foreground"
            >
              {t(item.labelKey)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <div
            className="mr-2 flex rounded-lg border border-border p-0.5"
            role="group"
            aria-label="Language"
          >
            {supportedLanguages.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => changeLanguage(language)}
                className={cn(
                  'rounded-md px-2 py-1 text-xs font-semibold uppercase',
                  i18n.language.startsWith(language)
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted hover:text-foreground',
                )}
              >
                {language}
              </button>
            ))}
          </div>
          <PrimaryButton onClick={scrollToContact}>{t('cta.leaveRequest')}</PrimaryButton>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex rounded-lg border border-border p-0.5">
            {supportedLanguages.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => changeLanguage(language)}
                className={cn(
                  'rounded-md px-2 py-1 text-xs font-semibold uppercase',
                  i18n.language.startsWith(language)
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted',
                )}
              >
                {language}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            <span className="sr-only">
              {isMobileMenuOpen ? t('cta.closeMenu') : t('cta.openMenu')}
            </span>
            <span className="text-lg leading-none">{isMobileMenuOpen ? '×' : '≡'}</span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-background px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navigationAnchors.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/5"
                onClick={closeMobileMenu}
              >
                {t(item.labelKey)}
              </a>
            ))}
            <div className="mt-3">
              <PrimaryButton className="w-full" onClick={scrollToContact}>
                {t('cta.leaveRequest')}
              </PrimaryButton>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
