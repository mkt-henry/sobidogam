'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Package, Users, BarChart3, FileSpreadsheet, Settings,
  ShoppingBag, Handshake, CreditCard, Search, LinkIcon,
  LayoutDashboard, UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navByRole: Record<UserRole, NavItem[]> = {
  BRAND: [
    { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { label: '상품 관리', href: '/brand/products', icon: Package },
    { label: '매칭 관리', href: '/brand/campaigns', icon: Handshake },
    { label: '정산', href: '/brand/settlements', icon: CreditCard },
  ],
  INFLUENCER: [
    { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { label: '상품 소싱', href: '/influencer/sourcing', icon: Search },
    { label: '내 공구', href: '/influencer/campaigns', icon: LinkIcon },
    { label: '실적', href: '/influencer/dashboard', icon: BarChart3 },
  ],
  ADMIN: [
    { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { label: '상품 검수', href: '/admin/products', icon: Package },
    { label: '캠페인 관리', href: '/admin/campaigns', icon: ShoppingBag },
    { label: '실적 업로드', href: '/admin/records', icon: FileSpreadsheet },
    { label: '정산 관리', href: '/admin/settlements', icon: CreditCard },
    { label: '사용자 관리', href: '/admin/users', icon: Users },
  ],
};

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = navByRole[role] || [];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Image src="/logo.png" alt="소비도감" width={32} height={32} className="rounded-lg" />
          소비도감
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
            pathname === '/profile'
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <UserCircle className="h-5 w-5" />
          프로필 설정
        </Link>
      </div>
    </aside>
  );
}
