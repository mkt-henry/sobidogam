'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/pagination';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import type { Profile, UserRole } from '@/types';

const PAGE_SIZE = 20;

const roleLabels: Record<UserRole, string> = {
  BRAND: '브랜드',
  INFLUENCER: '인플루언서',
  ADMIN: '관리자',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const supabase = createClient();

  const fetchUsers = async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (roleFilter !== 'ALL') query = query.eq('role', roleFilter);
    if (search) query = query.or(`company_name.ilike.%${search}%,contact_email.ilike.%${search}%`);

    const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
    setUsers((data as Profile[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, search]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
      toast.error('권한 변경 실패');
    } else {
      toast.success('권한이 변경되었습니다.');
      fetchUsers();
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    if (error) {
      toast.error('상태 변경 실패');
    } else {
      toast.success(newStatus === 'SUSPENDED' ? '사용자가 정지되었습니다.' : '사용자가 활성화되었습니다.');
      fetchUsers();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">사용자 관리</h1>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="이름 또는 이메일 검색..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter((v ?? 'ALL') as any); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="권한 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            <SelectItem value="BRAND">브랜드</SelectItem>
            <SelectItem value="INFLUENCER">인플루언서</SelectItem>
            <SelectItem value="ADMIN">관리자</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-gray-500">로딩 중...</p>
      ) : users.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">사용자가 없습니다.</CardContent></Card>
      ) : (
        <>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름/회사명</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>권한</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.company_name || '-'}</TableCell>
                    <TableCell>{user.contact_email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(v) => v && handleRoleChange(user.id, v as UserRole)}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRAND">브랜드</SelectItem>
                          <SelectItem value="INFLUENCER">인플루언서</SelectItem>
                          <SelectItem value="ADMIN">관리자</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}>
                        {user.status === 'ACTIVE' ? '활성' : '정지'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={user.status === 'ACTIVE' ? 'destructive' : 'outline'}
                        onClick={() => handleToggleStatus(user.id, user.status)}
                      >
                        {user.status === 'ACTIVE' ? '정지' : '활성화'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
