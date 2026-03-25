'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const conversations = [
  {
    q: '공동구매 해보고 싶은데, 사업자가 없어서 못 해요...',
    a: '소비도감은 사업자등록 없이도 시작할 수 있어요! 상품을 받아서 홍보만 하면 됩니다. 복잡한 서류 절차가 필요 없어요.',
  },
  {
    q: '상품은 어떻게 구하죠? 브랜드를 직접 찾아야 하나요?',
    a: '소싱 리스트에서 마음에 드는 상품을 골라 매칭 신청만 하세요. 검증된 브랜드의 상품이 이미 등록되어 있습니다.',
  },
  {
    q: '배송이나 고객 문의는 제가 해야 하나요?',
    a: '아니요! 배송과 CS는 모두 브랜드(공급사)가 처리합니다. 인플루언서는 홍보와 판매에만 집중하세요.',
  },
  {
    q: '수익은 어떻게 받나요? 정산이 복잡하지 않나요?',
    a: '판매 실적이 자동으로 집계되고, 마진율에 따른 수수료가 자동 계산됩니다. 투명한 정산 내역을 실시간으로 확인할 수 있어요.',
  },
];

export function LandingPainPoints() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900" />

      <div className="relative max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-orange-400 mb-3 tracking-wide uppercase">
            Q&A
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            이런 고민, 하고 계셨죠?
          </h2>
          <p className="text-lg text-stone-400">
            소비도감이 모두 해결해 드립니다.
          </p>
        </div>

        <div className="space-y-6">
          {conversations.map((conv, i) => (
            <div key={i} className={`animate-fade-in-up stagger-${Math.min(i + 1, 4)}`}>
              <div className="flex justify-end mb-3">
                <div className="max-w-md">
                  <div className="flex items-center gap-2 justify-end mb-1.5">
                    <span className="text-xs text-stone-500">인플루언서</span>
                    <div className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center">
                      <span className="text-xs">📱</span>
                    </div>
                  </div>
                  <div className="rounded-2xl rounded-tr-sm bg-stone-800 border border-white/10 px-5 py-3.5">
                    <p className="text-sm text-stone-300 leading-relaxed">{conv.q}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-md">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">S</span>
                    </div>
                    <span className="text-xs text-orange-400 font-medium">소비도감</span>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-orange-600/10 border border-orange-500/20 px-5 py-3.5">
                    <p className="text-sm text-stone-200 leading-relaxed">{conv.a}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 p-8 md:p-10 text-center shadow-xl shadow-orange-500/20">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
            사업자 없이도 지금 바로 시작하세요!
          </h3>
          <p className="text-orange-100/80 mb-6 text-sm">
            가입 후 5분이면 첫 상품을 소싱할 수 있습니다
          </p>
          <Link href="/signup">
            <Button className="h-12 px-8 bg-white text-orange-700 hover:bg-orange-50 font-semibold shadow-lg border-0">
              인플루언서로 시작하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
