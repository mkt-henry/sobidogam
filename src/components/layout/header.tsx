'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Menu, UserCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { NotificationDropdown } from './notification-dropdown';
import type { Profile } from '@/types';

export function Header({ profile }: { profile: Profile }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const roleLabel = {
    BRAND: '브랜드',
    INFLUENCER: '인플루언서',
    ADMIN: '관리자',
  }[profile.role];

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger
            className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar role={profile.role} />
          </SheetContent>
        </Sheet>
        <span className="text-sm text-gray-500">
          {profile.company_name || profile.contact_email} ({roleLabel})
        </span>
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown userId={profile.id} />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 hover:bg-gray-100"
          >
            <UserCircle className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="/profile" className="w-full">프로필 설정</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
