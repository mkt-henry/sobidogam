'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/pagination';
import type { Settlement } from '@/types';

const PAGE_SIZE = 20;

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  PENDING: { label: '정산 대기', variant: 'outline' },
  CONFIRMED: { label: '확인 완료', variant: 'secondary' },
  PAID: { label: '지급 완료', variant: 'default' },
};

export default function BrandSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const from = (page - 1) * PAGE_SIZE;
      const { data, count } = await supabase
        .from('settlements')
        .select('*, campaign:campaigns(*, product:products(*))', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      setSettlements((data as Settlement[]) || []);
      setTotal(count || 0);
      setLoading(false);
    }
    load();
  }, [page]);

  if (loading) return <div className="p-6">로딩 중...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">정산 대시보드</h1>
      {settlements.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">정산 내역이 없습니다.</CardContent></Card>
      ) : (
        <>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상품명</TableHead>
                  <TableHead>정산 기간</TableHead>
                  <TableHead className="text-right">총 판매액</TableHead>
                  <TableHead className="text-right">브랜드 지급액</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((s) => {
                  const st = statusLabels[s.status];
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{(s.campaign as any)?.product?.name || '-'}</TableCell>
                      <TableCell>{s.period_start} ~ {s.period_end}</TableCell>
                      <TableCell className="text-right">{Number(s.total_sales).toLocaleString()}원</TableCell>
                      <TableCell className="text-right">{Number(s.brand_payout).toLocaleString()}원</TableCell>
                      <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
