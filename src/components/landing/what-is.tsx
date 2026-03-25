import { ArrowRight, ChevronDown } from 'lucide-react';

export function LandingWhatIs() {
  return (
    <section id="what-is" className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 to-stone-900" />
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[300px] rounded-full opacity-15 blur-[120px]"
        style={{ background: 'linear-gradient(135deg, #ea580c, #d97706)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-orange-400 mb-3 tracking-wide uppercase">
            What is 소비도감?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            사업자 없는 인플루언서도
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              상품을 받아 홍보할 수 있는 플랫폼
            </span>
          </h2>
          <p className="text-lg text-stone-400 max-w-2xl mx-auto leading-relaxed">
            사업자등록 없이도 브랜드 상품을 받아 공동구매를 진행하고 수익을 올릴 수 있습니다.
            브랜드는 더 넓은 인플루언서 풀을 확보하고, 인플루언서는 진입 장벽 없이 시작할 수 있습니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 items-center">
            {/* Brand */}
            <div className="animate-fade-in-up stagger-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">브랜드 (공급사)</h3>
                <p className="text-sm text-stone-400">상품 등록 · 배송/CS 담당</p>
                <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20">넓은 셀러 풀</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20">성과형 마케팅</span>
                </div>
              </div>
            </div>

            {/* Platform */}
            <div className="animate-fade-in-up stagger-2 flex flex-col items-center">
              <div className="hidden md:flex items-center gap-2 mb-4">
                <div className="w-12 h-[2px] bg-gradient-to-r from-orange-500 to-transparent" />
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </div>
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm p-6 text-center w-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                  <span className="text-white text-xl font-bold">S</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">소비도감</h3>
                <p className="text-sm text-stone-300">매칭 · 실적관리 · 자동정산</p>
                <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">사업자 불필요</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">자동 정산</span>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 mt-4">
                <ArrowRight className="w-4 h-4 text-orange-400" />
                <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-orange-500" />
              </div>
              <div className="md:hidden flex flex-col items-center gap-1 my-3">
                <div className="w-[2px] h-6 bg-orange-500/50" />
                <ChevronDown className="w-4 h-4 text-orange-400" />
              </div>
            </div>

            {/* Influencer */}
            <div className="animate-fade-in-up stagger-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">인플루언서</h3>
                <p className="text-sm text-stone-400">상품 수령 · 홍보 · 수익 창출</p>
                <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">사업자 없어도 OK</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20">고마진 수익</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 rounded-full px-6 py-3 bg-orange-600/10 border border-orange-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-stone-300">
                <strong className="text-white">사업자등록 없이</strong> 누구나 인플루언서로 활동할 수 있습니다
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
