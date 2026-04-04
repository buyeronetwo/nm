import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import whySectionImage from '@/assets/image.png'
import { AnimatedGlassCard } from '@/components/ui/AnimatedGlassCard'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { usePrefersReducedMotion } from '@/hooks'

const cardKeys = ['stability', 'quality', 'support', 'professionalism', 'transparency'] as const

export function WhyUsSection() {
  const { t } = useTranslation()
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <section
      id="why"
      className="scroll-mt-24"
      aria-labelledby="why-heading"
    >
      <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-14">
        <ScrollReveal className="md:w-2/5">
          <div className="mx-auto flex max-w-[min(100%,320px)] justify-center md:mx-0 lg:max-w-[380px]">
            <img
              src={whySectionImage}
              alt={t('why.imageAlt')}
              width={760}
              height={760}
              decoding="async"
              loading="lazy"
              className="h-auto max-h-[min(52vh,520px)] w-full rounded-2xl border border-white/10 object-contain object-center shadow-lg shadow-black/30"
            />
          </div>
        </ScrollReveal>
        <div className="flex-1 space-y-8">
          <ScrollReveal>
            <h2
              id="why-heading"
              className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
            >
              {t('why.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-lg text-muted">{t('why.lead')}</p>
          </ScrollReveal>
          <ul className="grid gap-4 sm:grid-cols-2">
            {cardKeys.map((key, index) => (
              <li key={key} className="h-full">
                <AnimatedGlassCard delaySeconds={index * 0.05} innerClassName="p-6">
                  <motion.h3
                    className="text-lg font-bold leading-snug tracking-tight text-accent md:text-xl"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{
                      duration: 0.42,
                      delay: index * 0.05 + 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {t(`why.${key}.title`)}
                  </motion.h3>
                  <motion.p
                    className="mt-2 text-sm leading-relaxed text-muted"
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{
                      duration: 0.42,
                      delay: index * 0.05 + 0.16,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {t(`why.${key}.body`)}
                  </motion.p>
                </AnimatedGlassCard>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
