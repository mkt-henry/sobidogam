'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CheckCircle, ArrowRight, Package, BarChart3,
  Handshake, CreditCard, Search, Link as LinkIcon,
  LineChart, Wallet,
} from 'lucide-react';

const influencerBenefits = [
  '사업자등록 없이 바로 시작할 수 있습니다',
  '소싱 리스트에서 원하는 상품을 골라 매칭 신청만 하면 됩니다',
  '배송, CS는 브랜드가 처리 — 홍보에만 집중하세요',
  '전용 판매 링크로 실적이 자동 추적됩니다',
  '투명한 수수료 정산으로 안정적인 수익을 확보합니다',
];

const brandBenefits = [
  '사업자 제한 없는 폭넓은 인플루언서 풀에 상품을 노출합니다',
  '상품 등록 후 인플루언서가 직접 매칭 신청 — 영업 불필요',
  '일별 판매 실적과 정산 내역을 대시보드에서 실시간 확인합니다',
  '수수료 자동 계산으로 정산 업무가 간소화됩니다',
  '별도 결제 시스템 없이 아임웹으로 간편하게 판매합니다',
];

export function LandingForRoles() {
  const [activeTab, setActiveTab] = useState<'influencer' | 'brand'>('influencer');
  const isInfluencer = activeTab === 'influencer';

  return (
    <section id="for-roles" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-stone-900" />
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'linear-gradient(135deg, #ea580c, #d97706)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-orange-400 mb-3 tracking-wide uppercase">
            For You
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            누구를 위한 플랫폼인가요?
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-14">
          <div className="inline-flex rounded-full p-1 bg-white/5 border border-white/10" role="tablist" aria-label="대상 선택">
            <button
              onClick={() => setActiveTab('influencer')}
              role="tab"
              aria-selected={activeTab === 'influencer'}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'influencer'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/25'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              인플루언서
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              role="tab"
              aria-selected={activeTab === 'brand'}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === 'brand'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/25'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              브랜드 (공급사)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center" role="tabpanel">
          {/* Text side */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
              {isInfluencer
                ? '사업자 없이도 상품 받아서 홍보하고 수익을 올리세요'
                : '더 넓은 인플루언서 풀에 상품을 노출하세요'
              }
            </h3>
            <div className="space-y-4 mb-8">
              {(isInfluencer ? influencerBenefits : brandBenefits).map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-stone-300 leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
            <Link href="/signup">
              <Button className="h-12 px-8 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-0 shadow-lg shadow-orange-500/25">
                {isInfluencer ? '인플루언서로 시작하기' : '브랜드로 입점하기'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Visual side - mini dashboard mockup */}
          <div aria-hidden="true">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl shadow-black/20 overflow-hidden">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                </div>
                <span className="text-xs text-stone-500 ml-2">
                  {isInfluencer ? '인플루언서 대시보드' : '브랜드 대시보드'}
                </span>
              </div>
              <div className="p-5 bg-stone-950/50">
                {isInfluencer ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Search, label: '소싱 가능', val: '142', c: 'text-orange-400 bg-orange-500/10' },
                        { icon: LinkIcon, label: '진행 중', val: '5', c: 'text-amber-400 bg-amber-500/10' },
                        { icon: LineChart, label: '이번 달 판매', val: '3,240건', c: 'text-emerald-400 bg-emerald-500/10' },
                        { icon: Wallet, label: '내 수수료', val: '420만', c: 'text-orange-400 bg-orange-500/10' },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className={`w-8 h-8 rounded-lg ${item.c} flex items-center justify-center mb-2`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="text-xs text-stone-500">{item.label}</div>
                          <div className="text-lg font-bold text-white">{item.val}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-stone-500 mb-2">진행 중 공구</div>
                      {[
                        { name: '프리미엄 스킨케어 세트', status: '진행 중', sc: 'bg-emerald-500/10 text-emerald-400' },
                        { name: '수제 그래놀라 기획전', status: '링크 대기', sc: 'bg-amber-500/10 text-amber-400' },
                        { name: '친환경 텀블러', status: '매칭 완료', sc: 'bg-orange-500/10 text-orange-400' },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between py-1.5 text-sm">
                          <span className="text-stone-300">{item.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${item.sc}`}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Package, label: '등록 상품', val: '24', c: 'text-orange-400 bg-orange-500/10' },
                        { icon: Handshake, label: '매칭 완료', val: '18', c: 'text-amber-400 bg-amber-500/10' },
                        { icon: BarChart3, label: '이번 달 매출', val: '1.2억', c: 'text-emerald-400 bg-emerald-500/10' },
                        { icon: CreditCard, label: '정산 예정', val: '890만', c: 'text-orange-400 bg-orange-500/10' },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className={`w-8 h-8 rounded-lg ${item.c} flex items-center justify-center mb-2`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="text-xs text-stone-500">{item.label}</div>
                          <div className="text-lg font-bold text-white">{item.val}</div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-xs text-stone-500 mb-2">최근 매칭 요청</div>
                      {['뷰티 크리에이터 A', '라이프스타일 B', '푸드 인플루언서 C'].map((name) => (
                        <div key={name} className="flex items-center justify-between py-1.5 text-sm">
                          <span className="text-stone-300">{name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">대기 중</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
