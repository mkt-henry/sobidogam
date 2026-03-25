'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: '서비스 소개', href: '#features' },
  { label: '이용 방법', href: '#how-it-works' },
  { label: '브랜드', href: '#for-roles' },
  { label: '인플루언서', href: '#for-roles' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-stone-900/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 md:px-6" aria-label="메인 네비게이션">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="소비도감" width={36} height={36} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-white">SOBIDOGAM</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-stone-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm text-stone-300 hover:text-white hover:bg-white/10">
                로그인
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-0 shadow-lg shadow-orange-500/25">
                무료 시작하기
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2.5 rounded-lg hover:bg-white/10 transition-colors text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-stone-900/95 backdrop-blur-xl border-b border-white/10 animate-fade-in" role="navigation" aria-label="모바일 메뉴">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block py-2.5 text-sm font-medium text-stone-300 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/10 flex gap-3">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full text-sm border-stone-600 text-stone-300 hover:bg-white/10 hover:text-white">
                  로그인
                </Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button className="w-full text-sm bg-gradient-to-r from-orange-600 to-amber-600 text-white border-0">
                  시작하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
