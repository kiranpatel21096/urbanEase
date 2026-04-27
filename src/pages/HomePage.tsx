import { HeroSection } from '@/components/home/HeroSection'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { HowItWorks } from '@/components/home/HowItWorks'
import { StatsBar } from '@/components/home/StatsBar'
import { Testimonials } from '@/components/home/Testimonials'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <HowItWorks />
      <StatsBar />
      <Testimonials />
    </>
  )
}
