import { useTranslation } from 'react-i18next'

import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const principleKeys = ['principle1', 'principle2', 'principle3'] as const

export function AboutSection() {
  const { t } = useTranslation()

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="about" className="scroll-mt-24" aria-labelledby="about-heading">
      <ScrollReveal>
        <h2
          id="about-heading"
          className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
        >
          {t('about.title')}
        </h2>
      </ScrollReveal>
      <div className="mt-8 space-y-4 text-pretty text-muted">
        <ScrollReveal delaySeconds={0.04}>
          <p>{t('about.p1')}</p>
        </ScrollReveal>
        <ScrollReveal delaySeconds={0.08}>
          <p>{t('about.p2')}</p>
        </ScrollReveal>
        <ScrollReveal delaySeconds={0.12}>
          <p>{t('about.p3')}</p>
        </ScrollReveal>
      </div>
      <ScrollReveal className="mt-12" delaySeconds={0.06}>
        <h3 className="text-xl font-semibold text-foreground">{t('about.principlesTitle')}</h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {principleKeys.map((key) => (
            <li
              key={key}
              className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm leading-relaxed backdrop-blur-md"
            >
              <span className="font-semibold text-foreground">{t(`about.${key}.title`)}</span>
              <span className="mt-2 block text-muted">{t(`about.${key}.body`)}</span>
            </li>
          ))}
        </ul>
      </ScrollReveal>
      <ScrollReveal
        className="mt-12 rounded-2xl border border-white/10 bg-card/60 p-6 shadow-lg shadow-black/20 backdrop-blur-xl md:p-8"
        delaySeconds={0.08}
      >
        <p className="max-w-2xl text-pretty text-muted">{t('about.ctaLine')}</p>
        <div className="mt-5">
          <PrimaryButton onClick={scrollToContact}>{t('cta.leaveRequest')}</PrimaryButton>
        </div>
      </ScrollReveal>
    </section>
  )
}
