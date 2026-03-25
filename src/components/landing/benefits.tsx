import {
  UserCheck, ShoppingBag, Truck, BarChart3, Calculator,
  Bell, Shield, Smartphone, Users, Rocket,
} from 'lucide-react';

const benefits = [
  { num: '01', icon: UserCheck, badge: '사업자 불필요', title: '사업자등록 없이 누구나 인플루언서로 활동', desc: '개인 SNS 채널만 있으면 됩니다. 사업자등록, 통신판매업 신고 같은 복잡한 절차 없이 바로 공동구매를 시작하세요.' },
  { num: '02', icon: ShoppingBag, badge: '상품 수령', title: '브랜드 상품을 받아서 홍보만 하면 끝', desc: '소싱 리스트에서 마음에 드는 상품을 고르고 매칭 신청만 하세요. 상품을 받아 내 채널에서 홍보하면 수익이 발생합니다.' },
  { num: '03', icon: Truck, badge: '배송/CS 걱정 없음', title: '배송과 고객 문의는 브랜드가 담당합니다', desc: '인플루언서는 홍보와 판매에만 집중하세요. 상품 배송, 교환, 환불 등 모든 CS는 브랜드(공급사)가 직접 처리합니다.' },
  { num: '04', icon: BarChart3, badge: '실적 자동 집계', title: '내가 얼마나 팔았는지 대시보드에서 한눈에', desc: '일별 판매 실적이 자동으로 집계됩니다. 직관적인 차트와 수치로 내 판매 성과를 실시간 확인하세요.' },
  { num: '05', icon: Calculator, badge: '자동 정산', title: '수수료 자동 계산, 투명한 정산', desc: '마진율에 따른 수수료가 자동 계산되고, 정산 내역을 실시간 확인할 수 있습니다. 정산 관련 분쟁이 없습니다.' },
  { num: '06', icon: Shield, badge: '검증된 상품', title: '관리자가 직접 검수한 상품만 노출', desc: '모든 상품은 관리자 승인을 거칩니다. 품질이 보장된 상품만 소싱 리스트에 올라오니 안심하고 홍보할 수 있습니다.' },
  { num: '07', icon: Bell, badge: '실시간 알림', title: '매칭 수락, 링크 발급을 즉시 알림', desc: '매칭 상태가 변경되면 바로 알림을 받습니다. 브랜드 수락 → 판매 링크 수령까지 빠르게 진행할 수 있어요.' },
  { num: '08', icon: Smartphone, badge: '아임웹 연동', title: '전용 판매 링크로 실적이 자동 추적', desc: '아임웹 결제 시스템과 연동된 전용 링크가 발급됩니다. 별도 결제 시스템 없이 판매와 실적 추적이 가능합니다.' },
  { num: '09', icon: Users, badge: '브랜드에도 이득', title: '브랜드는 더 넓은 인플루언서 풀을 확보', desc: '사업자 제한이 없으니 마이크로 인플루언서부터 메가 인플루언서까지, 더 다양한 셀러에게 상품이 노출됩니다.' },
  { num: '10', icon: Rocket, badge: '5분이면 시작', title: '가입부터 첫 소싱까지 5분이면 충분합니다', desc: '간단한 가입 → 소싱 리스트 탐색 → 매칭 신청. 복잡한 심사 없이 바로 시작할 수 있습니다.' },
];

export function LandingBenefits() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-stone-900" />
      <div
        className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full opacity-10 blur-[120px]"
        style={{ background: 'linear-gradient(135deg, #ea580c, #d97706)' }}
      />

      <div className="relative max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-orange-400 mb-3 tracking-wide uppercase">
            10 Benefits
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            소비도감을 선택해야 하는{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">10가지 이유</span>
          </h2>
        </div>

        <div className="space-y-4">
          {benefits.map((b, i) => (
            <div
              key={b.num}
              className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 p-5 md:p-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-4 md:gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <span className="text-sm font-bold text-white">{b.num}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-orange-500/10 text-orange-400 border-orange-500/20">
                      {b.badge}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-1.5 leading-snug">{b.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{b.desc}</p>
                </div>
                <div className="hidden md:flex flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 items-center justify-center group-hover:bg-white/10 transition-colors">
                  <b.icon className="w-5 h-5 text-stone-500 group-hover:text-orange-400 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
