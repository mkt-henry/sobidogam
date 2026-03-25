import { Zap, BarChart3, Calculator, Bell, Shield, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: '자동 매칭 시스템',
    desc: '브랜드와 인플루언서를 효율적으로 연결합니다. 카테고리, 마진율 기반으로 최적의 매칭을 찾으세요.',
    gradient: 'from-orange-500 to-amber-500',
    glow: 'group-hover:shadow-orange-500/20',
  },
  {
    icon: BarChart3,
    title: '실시간 실적 관리',
    desc: '일별 판매 데이터를 엑셀 업로드로 간편하게 관리합니다. 직관적인 대시보드로 한눈에 확인하세요.',
    gradient: 'from-orange-500 to-amber-500',
    glow: 'group-hover:shadow-orange-500/20',
  },
  {
    icon: Calculator,
    title: '자동 정산',
    desc: '수수료 계산부터 정산까지 자동으로 처리합니다. 투명한 정산 내역을 실시간으로 확인할 수 있습니다.',
    gradient: 'from-orange-600 to-amber-500',
    glow: 'group-hover:shadow-orange-500/20',
  },
  {
    icon: Bell,
    title: '실시간 알림',
    desc: '매칭 상태, 승인 결과 등 중요한 소식을 실시간으로 받습니다. 놓치는 기회가 없습니다.',
    gradient: 'from-orange-500 to-amber-500',
    glow: 'group-hover:shadow-orange-500/20',
  },
  {
    icon: Shield,
    title: '관리자 검수',
    desc: '모든 상품과 매칭은 관리자가 직접 검수합니다. 신뢰할 수 있는 거래를 보장합니다.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'group-hover:shadow-orange-500/20',
  },
  {
    icon: Smartphone,
    title: '아임웹 연동',
    desc: '아임웹 결제 시스템과 자연스럽게 연동됩니다. 별도 결제 모듈 없이 바로 판매를 시작하세요.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'group-hover:shadow-orange-500/20',
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-8 blur-[120px]"
        style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b, #eab308)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-orange-400 mb-3 tracking-wide uppercase">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            공동구매에 필요한 모든 것
          </h2>
          <p className="text-lg text-stone-400 max-w-xl mx-auto">
            복잡한 프로세스는 줄이고, 핵심 가치에 집중할 수 있도록 설계했습니다.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl ${feature.glow} transition-all duration-300 animate-fade-in-up stagger-${i + 1}`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed">
                {feature.desc}
              </p>
              {/* Bottom gradient accent */}
              <div className={`absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
