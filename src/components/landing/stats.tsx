'use client';

import { useEffect, useRef, useState } from 'react';
import { Building2, Users, ShoppingBag, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Building2, value: 500, suffix: '+', label: '등록 브랜드' },
  { icon: Users, value: 2000, suffix: '+', label: '활동 인플루언서' },
  { icon: ShoppingBag, value: 10000, suffix: '+', label: '완료된 캠페인' },
  { icon: TrendingUp, value: 50, suffix: '억+', label: '누적 거래액' },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-white mb-2 tabular-nums">
      {display.toLocaleString()}{suffix}
    </div>
  );
}

export function LandingStats() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-900" />
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[300px] rounded-full opacity-15 blur-[120px]"
        style={{ background: 'linear-gradient(135deg, #ea580c, #d97706)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-5 shadow-lg shadow-orange-500/20">
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <div className="text-sm text-stone-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
