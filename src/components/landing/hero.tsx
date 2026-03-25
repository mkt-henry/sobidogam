'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';

const tags = ['#사업자없이도OK', '#상품받아서홍보만', '#배송CS걱정없음', '#누구나인플루언서'];

const slides = [
  { id: 'sourcing', title: '소싱 리스트', sub: '카테고리별 상품 탐색' },
  { id: 'matching', title: '매칭 관리', sub: '실시간 매칭 현황' },
  { id: 'dashboard', title: '실적 대시보드', sub: '일별 판매 추이 분석' },
];

export function LandingHero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveSlide((s) => (s + 1) % slides.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-[120px] animate-gradient"
          style={{ background: 'linear-gradient(135deg, #ea580c, #f59e0b)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, #d97706, #ea580c)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 w-full pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center rounded-full border mb-6 px-4 py-1.5 text-sm font-medium bg-white/10 text-orange-300 border-orange-500/30">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                사업자 없이 시작하는 공동구매
              </span>
            </div>

            <p className="animate-fade-in-up stagger-1 text-base md:text-lg text-orange-300/90 mb-3 font-medium">
              사업자등록 없이도 인플루언서가 될 수 있어요
            </p>

            <h1 className="animate-fade-in-up stagger-1 text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              상품만 받아서
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                홍보하면 수익이!
              </span>
            </h1>

            <div className="animate-fade-in-up stagger-2 flex flex-wrap items-center gap-2 mb-6 justify-center lg:justify-start">
              {tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-stone-300">
                  {tag}
                </span>
              ))}
            </div>

            <p className="animate-fade-in-up stagger-2 text-base md:text-lg text-stone-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              사업자등록 없이도 브랜드 상품을 받아 공동구매를 진행할 수 있습니다.
              매칭, 실적관리, 정산까지 소비도감이 모두 처리해 드려요.
            </p>

            <div className="animate-fade-in-up stagger-3 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-8">
              <Link href="/signup">
                <Button className="h-13 px-8 text-base bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-0 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                  인플루언서로 시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#for-roles">
                <Button variant="outline" className="h-13 px-8 text-base border-stone-600 text-stone-300 hover:bg-white/10 hover:text-white">
                  더 알아보기
                </Button>
              </a>
            </div>

            <div className="animate-fade-in-up stagger-4 flex items-center gap-6 text-sm text-stone-500 justify-center lg:justify-start">
              {['사업자 불필요', '배송/CS 걱정 없음', '즉시 시작'].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="animate-fade-in-up stagger-3 flex justify-center lg:justify-end" aria-hidden="true">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-600/15 to-amber-600/15 blur-3xl scale-110" />
              <div className="relative w-[280px] md:w-[320px] bg-stone-900 rounded-[3rem] border-4 border-stone-700 shadow-2xl shadow-black/40 overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-stone-900">
                  <span className="text-xs text-white font-medium">9:41</span>
                  <div className="w-24 h-6 bg-black rounded-full" />
                  <div className="flex gap-1">
                    <div className="w-4 h-2.5 rounded-sm bg-white/80" />
                    <div className="w-1.5 h-2.5 rounded-sm bg-white/60" />
                  </div>
                </div>
                <div className="px-5 pt-4 pb-3 bg-stone-900">
                  <div className="flex items-center gap-2 mb-4">
                    <Image src="/logo.png" alt="소비도감" width={28} height={28} className="rounded-lg" />
                    <span className="text-white font-semibold text-sm">소비도감</span>
                  </div>
                </div>
                <div className="bg-white min-h-[420px] md:min-h-[480px] relative">
                  {slides.map((slide, i) => (
                    <div key={slide.id} className={`absolute inset-0 transition-all duration-500 ${i === activeSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <div className="p-5">
                        <div className="text-xs text-gray-400 mb-1">{slide.sub}</div>
                        <div className="text-lg font-bold text-gray-900 mb-4">{slide.title}</div>
                        {i === 0 && <SlideSourceList />}
                        {i === 1 && <SlideMatching />}
                        {i === 2 && <SlideDashboard />}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white pb-4 flex justify-center gap-2" role="tablist" aria-label="슬라이드 선택">
                  {slides.map((slide, i) => (
                    <button key={slide.id} onClick={() => setActiveSlide(i)} aria-label={`${slide.title} 슬라이드`} aria-selected={i === activeSlide} role="tab"
                      className={`h-1.5 rounded-full transition-all ${i === activeSlide ? 'w-6 bg-orange-500' : 'w-1.5 bg-gray-300'}`} />
                  ))}
                </div>
                <div className="bg-white pb-2 flex justify-center"><div className="w-32 h-1 rounded-full bg-gray-900" /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <a href="#what-is" aria-label="아래로 스크롤" className="animate-bounce">
            <ChevronDown className="w-6 h-6 text-stone-500" />
          </a>
        </div>
      </div>
    </section>
  );
}

function SlideSourceList() {
  const items = ['프리미엄 스킨케어 세트', '수제 그래놀라 기획전', '친환경 텀블러 SET', '프로틴 바 체험팩'];
  return (
    <div className="space-y-3">
      {items.map((name, j) => (
        <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-300 to-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
            <div className="text-xs text-gray-400">마진 {15 + j * 3}%</div>
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">Pick</div>
        </div>
      ))}
    </div>
  );
}

function SlideMatching() {
  const items = [
    { name: '뷰티 크리에이터 A', status: '매칭 완료', c: 'bg-emerald-100 text-emerald-700' },
    { name: '라이프 인플루언서 B', status: '요청 대기', c: 'bg-orange-100 text-orange-700' },
    { name: '푸드 크리에이터 C', status: '진행 중', c: 'bg-stone-100 text-stone-700' },
  ];
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-amber-200" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">{item.name}</div>
            <div className={`text-xs px-2 py-0.5 rounded-full ${item.c} inline-block mt-1`}>{item.status}</div>
          </div>
        </div>
      ))}
      <div className="mt-2 p-3 rounded-xl bg-orange-50 border border-orange-100 text-center">
        <div className="text-xs text-orange-600 font-medium">오늘의 매칭 +3건</div>
      </div>
    </div>
  );
}

function SlideDashboard() {
  const stats = [
    { label: '총 판매액', val: '2.4억' },
    { label: '내 수수료', val: '3,600만' },
    { label: '주문 건수', val: '1,847' },
    { label: '진행 캠페인', val: '12' },
  ];
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const bars = [35, 55, 40, 70, 55, 85, 65];
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <div className="text-lg font-bold text-orange-600">{s.val}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
        <div className="text-xs text-gray-400 mb-2">주간 판매 추이</div>
        <div className="flex items-end gap-1.5 h-16">
          {bars.map((h, j) => (
            <div key={days[j]} className="flex-1 rounded-t bg-gradient-to-t from-orange-500 to-amber-400" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {days.map((d) => (
            <span key={d} className="text-[9px] text-gray-300 flex-1 text-center">{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
