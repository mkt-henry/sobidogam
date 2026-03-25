import { Shield, Lock, HeartHandshake } from 'lucide-react';

const trustItems = [
  {
    icon: Shield,
    title: '관리자 검수',
    desc: '모든 상품과 매칭은 관리자가 직접 검수합니다. 품질이 보장된 거래만 성사됩니다.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: Lock,
    title: '안전한 데이터',
    desc: '판매 데이터와 정산 정보를 안전하게 보호합니다. 역할 기반 접근 제어를 적용합니다.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: HeartHandshake,
    title: '공정한 정산',
    desc: '투명한 수수료 체계로 브랜드와 인플루언서 모두 만족하는 공정한 정산을 제공합니다.',
    gradient: 'from-amber-500 to-orange-500',
  },
];

const statsData = [
  { value: '99.9%', label: '서비스 가동률' },
  { value: '24시간', label: '평균 매칭 소요 시간' },
  { value: '100%', label: '정산 정확도' },
];

export function LandingTestimonials() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900" />
      <div
        className="absolute bottom-0 left-1/3 w-[600px] h-[300px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'linear-gradient(135deg, #eab308, #ea580c)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-orange-400 mb-3 tracking-wide uppercase">
            Trust
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            신뢰할 수 있는 플랫폼
          </h2>
          <p className="text-lg text-stone-400 max-w-xl mx-auto">
            안전하고 공정한 거래를 위한 장치를 갖추고 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="group relative text-center p-8 md:p-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} mb-6 shadow-lg`}>
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-stone-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-orange-600/20 border border-white/10 p-8 md:p-12 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {statsData.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-stone-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
