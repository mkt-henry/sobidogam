import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  서비스: [
    { label: '서비스 소개', href: '#features' },
    { label: '이용 방법', href: '#how-it-works' },
    { label: '브랜드 안내', href: '#for-roles' },
    { label: '인플루언서 안내', href: '#for-roles' },
  ],
  지원: [
    { label: '자주 묻는 질문', href: '#' },
    { label: '문의하기', href: '#' },
    { label: '이용약관', href: '#' },
    { label: '개인정보처리방침', href: '#' },
  ],
  계정: [
    { label: '로그인', href: '/login' },
    { label: '회원가입', href: '/signup' },
    { label: '대시보드', href: '/dashboard' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="relative bg-stone-950 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="소비도감" width={32} height={32} className="rounded-lg" />
              <span className="text-lg font-bold text-white">소비도감</span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              인플루언서 공동구매 매칭 플랫폼.<br />
              브랜드와 인플루언서를 연결합니다.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-stone-300 mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link href={link.href} className="text-sm text-stone-500 hover:text-stone-300 transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm text-stone-500 hover:text-stone-300 transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-stone-600">
              &copy; 2025 소비도감. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-stone-600">
              <a href="#" className="hover:text-stone-400 transition-colors">이용약관</a>
              <a href="#" className="hover:text-stone-400 transition-colors">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
