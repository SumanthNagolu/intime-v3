import { Hero } from '@/components/landing/Hero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { SocialProof } from '@/components/landing/SocialProof';
import { FivePillars } from '@/components/landing/FivePillars';
import { MidPageCTA } from '@/components/landing/MidPageCTA';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <ProblemSolution />
      <SocialProof />
      <FivePillars />
      <MidPageCTA />
      <FAQ />
      <Footer />
    </main>
  );
}
