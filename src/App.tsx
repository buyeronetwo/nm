import { AppShell, SiteFooter, SiteHeader } from '@/components/layout'
import { HtmlLangSync } from '@/components/providers/HtmlLangSync'
import {
  AboutSection,
  ContactSection,
  FaqSection,
  HeroSection,
  HowToStartSection,
  WhyUsSection,
  WorkModelsSection,
} from '@/components/sections'

function App() {
  return (
    <AppShell>
      <HtmlLangSync />
      <HeroSection />
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-20 px-4 py-12 sm:space-y-28 sm:px-6 md:py-16">
        <WhyUsSection />
        <WorkModelsSection />
        <AboutSection />
        <HowToStartSection />
        <FaqSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </AppShell>
  )
}

export default App
