'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LandingNavbar } from './navbar';
import { LandingHero } from './hero';
import { LandingWhatIs } from './what-is';
import { LandingPainPoints } from './pain-points';
import { LandingBenefits } from './benefits';
import { LandingHowItWorks } from './how-it-works';
import { LandingForRoles } from './for-roles';
import { LandingTestimonials } from './testimonials';
import { LandingCta } from './cta';
import { LandingFooter } from './footer';

function FloatingCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <Link
        href="/signup"
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm font-medium shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:from-orange-500 hover:to-amber-500 transition-all"
      >
        무료로 시작하기
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-950">
      <LandingNavbar />
      <LandingHero />
      <LandingWhatIs />
      <LandingPainPoints />
      <LandingBenefits />
      <LandingHowItWorks />
      <LandingForRoles />
      <LandingTestimonials />
      <LandingCta />
      <LandingFooter />
      <FloatingCta />
    </div>
  );
}
