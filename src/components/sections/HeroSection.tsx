import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import heroBackgroundVideoUrl from '@/assets/hf_20260404_125104_272a87c5-c266-45ec-a1cc-bd772d9be288.mp4'
import { usePreferLightMobileEffects } from '@/hooks'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/cn'

const environmentHeroVideoUrl = import.meta.env.VITE_HERO_VIDEO_URL?.trim()
const heroVideoSourceUrl =
  environmentHeroVideoUrl && environmentHeroVideoUrl.length > 0
    ? environmentHeroVideoUrl
    : heroBackgroundVideoUrl

const heroMinHeightClass = 'min-h-[calc(100svh-var(--site-header-height))]'

export function HeroSection() {
  const { t } = useTranslation()
  const preferLightMobileEffects = usePreferLightMobileEffects()
  const heroSectionReference = useRef<HTMLElement>(null)
  const heroVideoReference = useRef<HTMLVideoElement>(null)

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const useVideoLayer = Boolean(heroVideoSourceUrl)

  useEffect(() => {
    const sectionElement = heroSectionReference.current
    const videoElement = heroVideoReference.current
    if (!sectionElement || !videoElement || !useVideoLayer) {
      return
    }

    const boundVideoElement = videoElement
    let heroIsIntersecting = false

    function tryPlayVideoWhenAllowed(): void {
      if (!heroIsIntersecting || document.hidden) {
        return
      }
      void boundVideoElement.play().catch(() => undefined)
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        heroIsIntersecting =
          Boolean(entry?.isIntersecting) && (entry?.intersectionRatio ?? 0) > 0.06
        if (heroIsIntersecting) {
          tryPlayVideoWhenAllowed()
        } else {
          boundVideoElement.pause()
        }
      },
      {
        threshold: [0, 0.06, 0.2],
        rootMargin: '64px 0px 64px 0px',
      },
    )

    intersectionObserver.observe(sectionElement)

    function onDocumentVisibilityChange(): void {
      if (document.hidden) {
        boundVideoElement.pause()
      } else {
        tryPlayVideoWhenAllowed()
      }
    }

    document.addEventListener('visibilitychange', onDocumentVisibilityChange)

    return () => {
      intersectionObserver.disconnect()
      document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
    }
  }, [useVideoLayer])

  return (
    <section
      ref={heroSectionReference}
      id="hero"
      className={cn(
        'relative scroll-mt-0 overflow-x-hidden border-b border-border',
        heroMinHeightClass,
      )}
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {useVideoLayer ? (
          <div className="hero-video-wrap absolute inset-0">
            <video
              ref={heroVideoReference}
              className="hero-video-el absolute inset-0 h-full w-full object-cover object-[50%_50%]"
              src={heroVideoSourceUrl}
              autoPlay
              loop
              muted
              playsInline
              preload={preferLightMobileEffects ? 'metadata' : 'auto'}
            />
            <div className="hero-backdrop-vignette absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/65" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35" />
          </div>
        ) : null}
        {!useVideoLayer ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/95 via-background to-black" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,rgba(129,140,248,0.1),transparent_60%)]" />
          </>
        ) : null}
        <div
          className={cn(
            'absolute inset-0',
            useVideoLayer
              ? 'bg-gradient-to-b from-background/92 via-background/82 to-background/72'
              : 'bg-gradient-to-b from-background/55 via-background/78 to-background/95',
          )}
        />
      </div>

      <div
        className={cn(
          'relative z-10 mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-20',
          heroMinHeightClass,
        )}
      >
        <ScrollReveal className="w-full">
          <p className="text-accent-volume text-xs font-medium uppercase tracking-[0.2em] sm:text-sm">
            {t('hero.eyebrow')}
          </p>
          <h1
            id="hero-heading"
            className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-bold tracking-tight text-foreground drop-shadow-sm sm:mt-4 sm:text-4xl md:text-5xl"
          >
            <span className="block">
              {t('hero.offerBefore')}{' '}
              <span className="text-accent-volume">{t('hero.offerAccent')}</span>{' '}
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
