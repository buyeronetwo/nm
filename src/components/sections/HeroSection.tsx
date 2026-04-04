import { useTranslation } from 'react-i18next'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/cn'

const heroVideoUrl = import.meta.env.VITE_HERO_VIDEO_URL?.trim()

export function HeroSection() {
  const { t } = useTranslation()

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const hasVideo = Boolean(heroVideoUrl && heroVideoUrl.length > 0)

  return (
    <section
      id="hero"
      className="relative min-h-svh scroll-mt-0 overflow-hidden border-b border-border"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0" aria-hidden>
        {hasVideo && heroVideoUrl ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : null}
        {!hasVideo ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/85 via-background to-zinc-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,rgba(129,140,248,0.18),transparent_60%)]" />
          </>
        ) : null}
        <div
          className={cn(
            'absolute inset-0',
            hasVideo
              ? 'bg-gradient-to-b from-background/90 via-background/75 to-background/50'
              : 'bg-gradient-to-b from-background/45 via-background/65 to-background/88',
          )}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <ScrollReveal className="w-full">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent sm:text-sm">
            {t('hero.eyebrow')}
          </p>
          <h1
            id="hero-heading"
            className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight text-foreground drop-shadow-sm sm:mt-4 sm:text-4xl md:text-5xl"
          >
            <span className="block">
              {t('hero.offerBefore')}{' '}
              <span className="text-accent">{t('hero.offerAccent')}</span>{' '}
              {t('hero.offerAfter')}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted sm:mt-5 sm:text-base">
            {t('hero.subtitle')}
          </p>
          <div className="mt-6 flex justify-center sm:mt-8">
            <PrimaryButton onClick={scrollToContact}>{t('cta.leaveRequest')}</PrimaryButton>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
