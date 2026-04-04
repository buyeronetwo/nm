import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { AnimatedGlassCard } from '@/components/ui/AnimatedGlassCard'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { usePrefersReducedMotion } from '@/hooks'

const modelKeys = ['cpl', 'crg', 'cpa'] as const

export function WorkModelsSection() {
  const { t } = useTranslation()
  const prefersReducedMotion = usePrefersReducedMotion()

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
          <AnimatedGlassCard
            key={key}
            delaySeconds={index * 0.07}
            innerClassName="flex h-full flex-col p-6"
          >
            <motion.p
              className="text-2xl font-black uppercase tracking-[0.12em] text-accent drop-shadow-[0_0_24px_rgba(181,23,32,0.35)] md:text-3xl"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.42,
                delay: index * 0.07 + 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {t(`models.${key}.name`)}
            </motion.p>
            <motion.p
              className="mt-4 text-sm leading-relaxed text-muted"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.42,
                delay: index * 0.07 + 0.16,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {t(`models.${key}.body`)}
            </motion.p>
          </AnimatedGlassCard>
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
