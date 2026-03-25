'use client';

import { useState } from 'react';

const steps = [
  {
    id: 'signup',
    num: '01',
    tab: '회원가입',
    title: '무료 회원가입',
    desc: '간단한 정보만 입력하면 바로 가입이 완료됩니다. 사업자등록이 필요 없어 누구나 즉시 시작할 수 있습니다.',
    screen: {
      title: '회원가입',
      content: (
        <div className="space-y-3">
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <div className="text-[10px] text-gray-400 mb-1">가입 유형</div>
            <div className="flex gap-2">
              <div className="flex-1 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-xs text-center font-medium">인플루언서</div>
              <div className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs text-center">브랜드 (공급사)</div>
            </div>
          </div>
          {['이메일', '비밀번호', 'SNS 채널 (인스타/블로그)', '연락처'].map((field) => (
            <div key={field} className="rounded-lg bg-white border border-gray-200 p-3">
              <div className="text-[10px] text-gray-400 mb-1">{field}</div>
              <div className="h-3 w-3/4 rounded bg-gray-100" />
            </div>
          ))}
          <div className="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-center">
            <span className="text-white text-xs font-medium">무료 가입하기</span>
          </div>
        </div>
      ),
    },
  },
  {
    id: 'sourcing',
    num: '02',
    tab: '상품 소싱',
    title: '원하는 상품 선택',
    desc: '소싱 리스트에서 카테고리, 마진율을 보고 홍보할 상품을 고릅니다. 관리자가 검수한 상품만 노출되니 안심하세요.',
    screen: {
      title: '소싱 리스트',
      content: (
        <div className="space-y-3">
          <div className="flex gap-2">
            {['전체', '뷰티', '식품', '리빙'].map((cat, i) => (
              <div key={cat} className={`flex-1 py-1.5 rounded-lg text-xs text-center font-medium ${i === 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{cat}</div>
            ))}
          </div>
          {[
            { name: '프리미엄 스킨케어 세트', margin: '28%', category: '뷰티' },
            { name: '수제 그래놀라 기획전', margin: '22%', category: '식품' },
            { name: '친환경 텀블러 SET', margin: '35%', category: '리빙' },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-900 truncate">{item.name}</div>
                <div className="text-[10px] text-gray-400">{item.category} · 마진 {item.margin}</div>
              </div>
              <div className="text-[10px] px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium flex-shrink-0">Pick</div>
            </div>
          ))}
        </div>
      ),
    },
  },
  {
    id: 'matching',
    num: '03',
    tab: '매칭',
    title: '브랜드와 매칭',
    desc: '원하는 상품에 매칭을 신청하면 브랜드가 검토 후 수락합니다. 매칭이 완료되면 전용 판매 링크를 받게 됩니다.',
    screen: {
      title: '매칭 현황',
      content: (
        <div className="space-y-3">
          {[
            { name: '프리미엄 스킨케어 세트', status: '매칭 완료', sc: 'bg-emerald-100 text-emerald-700' },
            { name: '수제 그래놀라 기획전', status: '대기 중', sc: 'bg-orange-100 text-orange-700' },
            { name: '친환경 텀블러 SET', status: '매칭 완료', sc: 'bg-emerald-100 text-emerald-700' },
          ].map((item) => (
            <div key={item.name} className="rounded-lg bg-white border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-900">{item.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.sc}`}>{item.status}</span>
              </div>
              {item.status === '매칭 완료' && (
                <div className="rounded bg-orange-50 px-2.5 py-1.5">
                  <div className="text-[10px] text-orange-600 font-medium">🔗 판매 링크 발급 완료</div>
                </div>
              )}
            </div>
          ))}
          <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-center">
            <span className="text-xs text-orange-600 font-medium">링크를 받으면 바로 공구를 시작하세요!</span>
          </div>
        </div>
      ),
    },
  },
  {
    id: 'selling',
    num: '04',
    tab: '판매 진행',
    title: '홍보 & 판매',
    desc: '전용 판매 링크를 내 SNS 채널에 공유하고 공동구매를 진행합니다. 배송과 CS는 브랜드가 처리하니 홍보에만 집중하세요.',
    screen: {
      title: '캠페인 현황',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '오늘 주문', val: '47건', c: 'text-orange-600' },
              { label: '오늘 매출', val: '230만', c: 'text-emerald-600' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-white border border-gray-200 p-2.5 text-center">
                <div className={`text-base font-bold ${s.c}`}>{s.val}</div>
                <div className="text-[10px] text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-3">
            <div className="text-[10px] text-gray-400 mb-2">주간 판매 추이</div>
            <div className="flex items-end gap-1.5 h-14">
              {[30, 50, 45, 75, 60, 90, 70].map((h, j) => (
                <div key={j} className="flex-1 rounded-t bg-gradient-to-t from-orange-500 to-amber-400" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
                <span key={d} className="text-[8px] text-gray-300 flex-1 text-center">{d}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
            <div className="text-[10px] text-emerald-700 font-medium text-center">📦 배송/CS는 브랜드가 처리합니다</div>
          </div>
        </div>
      ),
    },
  },
  {
    id: 'settlement',
    num: '05',
    tab: '정산',
    title: '수익 정산',
    desc: '판매 실적에 따라 수수료가 자동 계산됩니다. 관리자가 정산을 확정하면 내역을 확인하고 수익을 받을 수 있습니다.',
    screen: {
      title: '정산 내역',
      content: (
        <div className="space-y-3">
          <div className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 p-3 text-center">
            <div className="text-[10px] text-orange-600 mb-0.5">이번 달 정산 예정</div>
            <div className="text-xl font-bold text-orange-700">₩ 3,640,000</div>
          </div>
          {[
            { campaign: '스킨케어 세트 공구', amount: '₩ 1,820,000', status: '확정', sc: 'bg-emerald-100 text-emerald-700' },
            { campaign: '그래놀라 기획전', amount: '₩ 1,120,000', status: '확정', sc: 'bg-emerald-100 text-emerald-700' },
            { campaign: '텀블러 SET 공구', amount: '₩ 700,000', status: '대기', sc: 'bg-orange-100 text-orange-700' },
          ].map((item) => (
            <div key={item.campaign} className="rounded-lg bg-white border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-900">{item.campaign}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.sc}`}>{item.status}</span>
              </div>
              <div className="text-sm font-bold text-gray-900">{item.amount}</div>
            </div>
          ))}
        </div>
      ),
    },
  },
];

export function LandingHowItWorks() {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <section id="how-it-works" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900" />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[300px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'linear-gradient(135deg, #ea580c, #d97706)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-orange-400 mb-3 tracking-wide uppercase">
            How it works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            5단계로 시작하는 공동구매
          </h2>
          <p className="text-lg text-stone-400 max-w-xl mx-auto">
            복잡한 프로세스는 소비도감이 처리합니다. 홍보에만 집중하세요.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-2xl p-1 bg-white/5 border border-white/10 gap-1 overflow-x-auto max-w-full" role="tablist" aria-label="이용 단계">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                role="tab"
                aria-selected={i === active}
                aria-controls={`step-panel-${s.id}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  i === active
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/25'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`text-xs font-bold ${i === active ? 'text-orange-200' : 'text-stone-600'}`}>{s.num}</span>
                {s.tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content: text + screen mockup */}
        <div id={`step-panel-${step.id}`} role="tabpanel" className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: description */}
          <div>
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <span className="text-lg font-bold text-white">{step.num}</span>
              </div>
              <div>
                <div className="text-xs text-orange-400 font-medium">STEP {step.num}</div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{step.title}</h3>
              </div>
            </div>
            <p className="text-stone-400 leading-relaxed text-lg mb-8">
              {step.desc}
            </p>
            {/* Progress dots */}
            <div className="flex items-center gap-3" role="group" aria-label="단계 진행률">
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  aria-label={`${s.tab} 단계`}
                  className={`h-2 rounded-full transition-all ${
                    i === active ? 'w-8 bg-orange-500' : i < active ? 'w-2 bg-orange-500/50' : 'w-2 bg-stone-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right: phone mockup with screen content */}
          <div className="flex justify-center lg:justify-end" aria-hidden="true">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-600/15 to-amber-600/15 blur-3xl scale-110" />
              <div className="relative w-[280px] md:w-[300px] bg-stone-900 rounded-[2.5rem] border-4 border-stone-700 shadow-2xl shadow-black/40 overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-stone-900">
                  <span className="text-[10px] text-white font-medium">9:41</span>
                  <div className="w-20 h-5 bg-black rounded-full" />
                  <div className="flex gap-1">
                    <div className="w-3.5 h-2 rounded-sm bg-white/80" />
                  </div>
                </div>
                {/* App header */}
                <div className="px-4 pt-3 pb-2 bg-stone-900 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">S</span>
                    </div>
                    <span className="text-white font-semibold text-xs">{step.screen.title}</span>
                  </div>
                </div>
                {/* Screen content */}
                <div className="bg-gray-50 p-4 min-h-[400px] md:min-h-[440px]">
                  {step.screen.content}
                </div>
                {/* Bottom bar */}
                <div className="bg-gray-50 pb-2 flex justify-center">
                  <div className="w-28 h-1 rounded-full bg-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
