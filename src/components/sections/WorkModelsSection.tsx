import { useTranslation } from 'react-i18next'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const modelKeys = ['cpl', 'crg', 'cpa'] as const

export function WorkModelsSection() {
  const { t } = useTranslation()

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="models" className="scroll-mt-24" aria-labelledby="models-heading">
      <ScrollReveal>
        <h2
          id="models-heading"
          className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
        >
          {t('models.title')}
        </h2>
        <p className="mt-2 text-muted">{t('models.subtitle')}</p>
      </ScrollReveal>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {modelKeys.map((key, index) => (
          <ScrollReveal key={key} delaySeconds={index * 0.07}>
            <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-card/70 p-6 text-card-foreground shadow-lg shadow-black/15 backdrop-blur-xl">
              <p className="text-sm font-medium uppercase tracking-wide text-accent">
                {t(`models.${key}.name`)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t(`models.${key}.body`)}
              </p>
            </article>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal
        className="mt-12 rounded-2xl border border-white/10 bg-card/60 p-6 shadow-lg shadow-black/20 backdrop-blur-xl md:p-8"
        delaySeconds={0.1}
      >
        <p className="max-w-2xl text-pretty text-muted">{t('models.ctaLine')}</p>
        <div className="mt-5">
          <PrimaryButton onClick={scrollToContact}>{t('cta.leaveRequest')}</PrimaryButton>
        </div>
      </ScrollReveal>
    </section>
  )
}
