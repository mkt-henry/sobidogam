'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/pagination';
import { toast } from 'sonner';
import type { Settlement, Campaign } from '@/types';

const PAGE_SIZE = 20;

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  PENDING: { label: '정산 대기', variant: 'outline' },
  CONFIRMED: { label: '확인 완료', variant: 'secondary' },
  PAID: { label: '지급 완료', variant: 'default' },
};

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [completedCampaigns, setCompletedCampaigns] = useState<Campaign[]>([]);
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [platformFeeRate, setPlatformFeeRate] = useState('0');
  const supabase = createClient();

  const fetchSettlements = async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const { data, count } = await supabase
      .from('settlements')
      .select('*, campaign:campaigns(*, product:products(name), influencer:profiles!campaigns_influencer_id_fkey(company_name))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    setSettlements((data as Settlement[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const fetchCompletedCampaigns = async () => {
    const { data } = await supabase
      .from('campaigns')
      .select('*, product:products(name)')
      .eq('status', 'COMPLETED');
    setCompletedCampaigns((data as Campaign[]) || []);
  };

  useEffect(() => { fetchSettlements(); fetchCompletedCampaigns(); }, [page]);

  const handleCreateSettlement = async () => {
    if (!selectedCampaign || !periodStart || !periodEnd) {
      toast.error('모든 필드를 입력해 주세요.');
      return;
    }

    // Get daily records for this campaign and period
    const { data: records } = await supabase
      .from('daily_records')
      .select('*')
      .eq('campaign_id', selectedCampaign)
      .gte('record_date', periodStart)
      .lte('record_date', periodEnd);

    if (!records || records.length === 0) {
      toast.error('해당 기간에 실적 데이터가 없습니다.');
      return;
    }

    const totalSales = records.reduce((s, r) => s + Number(r.total_sales_amount), 0);
    const totalRefunds = records.reduce((s, r) => s + Number(r.refund_amount), 0);
    const influencerPayout = records.reduce((s, r) => s + Number(r.influencer_commission), 0);
    const feeRate = Number(platformFeeRate) / 100;
    const platformFee = totalSales * feeRate;
    const brandPayout = totalSales - influencerPayout - platformFee - totalRefunds;

    const { error } = await supabase.from('settlements').insert({
      campaign_id: selectedCampaign,
      period_start: periodStart,
      period_end: periodEnd,
      total_sales: totalSales,
      total_refunds: totalRefunds,
      influencer_payout: influencerPayout,
      brand_payout: brandPayout,
      platform_fee: platformFee,
      status: 'PENDING',
    });

    if (error) {
      toast.error('정산 생성 실패: ' + error.message);
    } else {
      toast.success('정산이 생성되었습니다.');
      setCreateDialog(false);
      setSelectedCampaign('');
      fetchSettlements();
    }
  };

  const handleStatusUpdate = async (id: string, status: 'CONFIRMED' | 'PAID') => {
    const updates: any = { status };
    if (status === 'PAID') updates.settled_at = new Date().toISOString();

    const { error } = await supabase.from('settlements').update(updates).eq('id', id);
    if (!error) {
      toast.success('상태가 변경되었습니다.');
      fetchSettlements();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">정산 관리</h1>
        <Button onClick={() => setCreateDialog(true)}>정산 생성</Button>
      </div>

      {settlements.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">정산 내역이 없습니다.</CardContent></Card>
      ) : (
        <>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상품명</TableHead>
                  <TableHead>인플루언서</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead className="text-right">총 판매액</TableHead>
                  <TableHead className="text-right">인플루언서</TableHead>
                  <TableHead className="text-right">브랜드</TableHead>
                  <TableHead className="text-right">수수료</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((s) => {
                  const st = statusLabels[s.status];
                  const c = s.campaign as any;
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{c?.product?.name || '-'}</TableCell>
                      <TableCell>{c?.influencer?.company_name || '-'}</TableCell>
                      <TableCell className="text-sm">{s.period_start} ~ {s.period_end}</TableCell>
                      <TableCell className="text-right">{Number(s.total_sales).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{Number(s.influencer_payout).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{Number(s.brand_payout).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{Number(s.platform_fee).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                      <TableCell>
                        {s.status === 'PENDING' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(s.id, 'CONFIRMED')}>확인</Button>
                        )}
                        {s.status === 'CONFIRMED' && (
                          <Button size="sm" onClick={() => handleStatusUpdate(s.id, 'PAID')}>지급완료</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </>
      )}

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>정산 생성</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>캠페인 선택</Label>
              <Select value={selectedCampaign} onValueChange={(v) => setSelectedCampaign(v ?? '')}>
                <SelectTrigger><SelectValue placeholder="캠페인 선택" /></SelectTrigger>
                <SelectContent>
                  {completedCampaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {(c.product as any)?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>시작일</Label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>종료일</Label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>플랫폼 수수료율 (%)</Label>
              <Input type="number" value={platformFeeRate} onChange={(e) => setPlatformFeeRate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>취소</Button>
            <Button onClick={handleCreateSettlement}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
