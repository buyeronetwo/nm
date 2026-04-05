import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { usePreferLightMobileEffects, usePrefersReducedMotion } from '@/hooks'
import { cn } from '@/lib/cn'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const faqIndices = [0, 1, 2, 3, 4] as const

export function FaqSection() {
  const { t } = useTranslation()
  const prefersReducedMotion = usePrefersReducedMotion()
  const preferLightMobileEffects = usePreferLightMobileEffects()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const useInstantAccordionMotion = prefersReducedMotion || preferLightMobileEffects
  const panelTransition = useInstantAccordionMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <section id="faq" className="scroll-mt-24" aria-labelledby="faq-heading">
      <ScrollReveal>
        <h2
          id="faq-heading"
          className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
        >
          {t('faq.title')}
        </h2>
      </ScrollReveal>
      <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md">
        {faqIndices.map((index) => {
          const isOpen = openIndex === index
          const questionId = `faq-q-${index}`
          const answerId = `faq-a-${index}`
          return (
            <ScrollReveal key={index}>
              <div className="px-4 py-1 md:px-6">
                <button
                  type="button"
                  id={questionId}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="text-accent-volume-flat text-base font-bold leading-snug tracking-tight md:text-lg">
                    {t(`faq.q${index}`)}
                  </span>
                  {useInstantAccordionMotion ? (
                    <span
                      className={cn(
                        'text-xl',
                        isOpen ? 'text-accent-volume-flat' : 'text-muted',
                        isOpen && 'inline-block rotate-45',
                      )}
                      aria-hidden
                    >
                      +
                    </span>
                  ) : (
                    <motion.span
                      className={cn('text-xl', isOpen ? 'text-accent-volume-flat' : 'text-muted')}
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={panelTransition}
                      aria-hidden
                    >
                      +
                    </motion.span>
                  )}
                </button>
                <motion.div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  aria-hidden={!isOpen}
                  initial={false}
                  animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={panelTransition}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pt-0">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                      {t(`faq.a${index}`)}
                    </p>
                  </div>
                </motion.div>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </section>
  )
}
