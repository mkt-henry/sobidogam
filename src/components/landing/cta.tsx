import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function LandingCta() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 to-stone-950" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(234,88,12,0.3), transparent 50%), radial-gradient(circle at 80% 50%, rgba(217,119,6,0.3), transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          사업자 없이{' '}
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            인플루언서
          </span>
          로 시작하세요
        </h2>
        <p className="text-lg text-stone-400 mb-10 max-w-xl mx-auto">
          상품을 받아 홍보만 하면 수익이 발생합니다.
          가입은 무료, 5분이면 첫 상품을 소싱할 수 있습니다.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button className="h-13 px-8 text-base bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-0 shadow-lg shadow-orange-500/30">
              인플루언서로 시작하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="outline"
              className="h-13 px-8 text-base border-stone-600 text-stone-300 hover:bg-white/10 hover:text-white"
            >
              브랜드 입점 문의
            </Button>
          </Link>
        </div>
        <p className="mt-8 text-sm text-stone-500">
          궁금한 점이 있으신가요? support@sobidogam.com
        </p>
      </div>
    </section>
  );
}
