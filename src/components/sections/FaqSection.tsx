import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ScrollReveal } from '@/components/ui/ScrollReveal'

const faqIndices = [0, 1, 2, 3, 4] as const

export function FaqSection() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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
                  <span className="text-base font-bold leading-snug tracking-tight text-accent md:text-lg">
                    {t(`faq.q${index}`)}
                  </span>
                  <span
                    className={
                      isOpen
                        ? 'text-xl text-accent transition-transform rotate-45'
                        : 'text-xl text-muted transition-transform'
                    }
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  hidden={!isOpen}
                >
                  <p className="whitespace-pre-line pb-4 text-sm leading-relaxed text-muted">
                    {t(`faq.a${index}`)}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </section>
  )
}
