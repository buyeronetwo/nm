import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { getVacanciesRequestUrl } from '@/lib/vacanciesApiUrl'
import { pickLocalizedBlock } from '@/lib/vacancyDisplay'
import { type Vacancy, parseVacanciesResponse } from '@/lib/vacancyTypes'

type VacanciesLoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; vacancies: Vacancy[] }

export function CareersSection() {
  const { t, i18n } = useTranslation()
  const [loadState, setLoadState] = useState<VacanciesLoadState>({ status: 'loading' })

  useEffect(() => {
    let isActive = true
    const requestUrl = getVacanciesRequestUrl()
    ;(async () => {
      try {
        const response = await fetch(requestUrl, { headers: { Accept: 'application/json' } })
        if (!isActive) {
          return
        }
        if (!response.ok) {
          setLoadState({ status: 'error' })
          return
        }
        const jsonUnknown: unknown = await response.json()
        const vacancies = parseVacanciesResponse(jsonUnknown)
        if (!isActive) {
          return
        }
        setLoadState({ status: 'success', vacancies })
      } catch {
        if (!isActive) {
          return
        }
        setLoadState({ status: 'error' })
      }
    })()
    return () => {
      isActive = false
    }
  }, [])

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  const telegramHandle = t('footer.telegram')
  const telegramPath = telegramHandle.replace(/^@/, '')
  const activeLanguage = i18n.language

  const showFallbackCard =
    loadState.status === 'error' ||
    (loadState.status === 'success' && loadState.vacancies.length === 0)

  const apiVacancies = loadState.status === 'success' ? loadState.vacancies : []

  return (
    <section id="careers" className="scroll-mt-24" aria-labelledby="careers-heading">
      <ScrollReveal>
        <h2
          id="careers-heading"
          className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
        >
          {t('careers.title')}
        </h2>
        <p className="mt-4 max-w-2xl text-pretty text-lg text-muted">{t('careers.lead')}</p>
      </ScrollReveal>

      {loadState.status === 'loading' ? (
        <ScrollReveal className="mt-10">
          <p className="text-sm text-muted">{t('careers.loading')}</p>
        </ScrollReveal>
      ) : null}

      {loadState.status === 'error' ? (
        <ScrollReveal className="mt-10">
          <p className="text-sm text-accent">{t('careers.loadError')}</p>
        </ScrollReveal>
      ) : null}

      {loadState.status === 'success' && loadState.vacancies.length === 0 ? (
        <ScrollReveal className="mt-6">
          <p className="text-sm text-muted">{t('careers.emptyFromApi')}</p>
        </ScrollReveal>
      ) : null}

      <div className="mt-10 flex flex-col gap-8">
        {apiVacancies.map((vacancy, index) => (
          <ScrollReveal key={vacancy.id} delaySeconds={index * 0.05}>
            <article className="rounded-2xl border border-white/8 bg-card/85 p-6 shadow-lg shadow-black/40 backdrop-blur-xl md:p-8">
              <h3 className="text-accent-volume text-xl font-bold tracking-tight md:text-2xl">
                {pickLocalizedBlock(vacancy.title, activeLanguage)}
              </h3>
              <p className="mt-3 text-sm font-medium text-foreground">{t('careers.roleRequirementsLabel')}</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted whitespace-pre-line">
                {pickLocalizedBlock(vacancy.requirements, activeLanguage)}
              </p>
              <p className="mt-6 text-sm leading-relaxed text-muted">{t('careers.applyIntro')}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <PrimaryButton onClick={scrollToContact}>{t('cta.leaveRequest')}</PrimaryButton>
                <a
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
                  href={`https://t.me/${telegramPath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('careers.applyTelegram')}
                </a>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>

      {showFallbackCard ? (
        <ScrollReveal className="mt-10" delaySeconds={0.06}>
          <article className="rounded-2xl border border-white/8 bg-card/85 p-6 shadow-lg shadow-black/40 backdrop-blur-xl md:p-8">
            <h3 className="text-accent-volume text-xl font-bold tracking-tight md:text-2xl">
              {t('careers.roleTitle')}
            </h3>
            <p className="mt-3 text-sm font-medium text-foreground">{t('careers.roleRequirementsLabel')}</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {t('careers.roleRequirements')}
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted">{t('careers.applyIntro')}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <PrimaryButton onClick={scrollToContact}>{t('cta.leaveRequest')}</PrimaryButton>
              <a
                className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
                href={`https://t.me/${telegramPath}`}
                target="_blank"
                rel="noreferrer"
              >
                {t('careers.applyTelegram')}
              </a>
            </div>
          </article>
        </ScrollReveal>
      ) : null}
    </section>
  )
}
