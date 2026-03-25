'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/pagination';
import { toast } from 'sonner';
import { createNotification } from '@/lib/notifications';
import type { Campaign, CampaignStatus } from '@/types';

const PAGE_SIZE = 20;

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  REQUESTED: { label: '요청 대기', variant: 'outline' },
  MATCHED: { label: '매칭 완료', variant: 'default' },
  REJECTED: { label: '거절', variant: 'destructive' },
  CANCELLED: { label: '취소', variant: 'secondary' },
  ONGOING: { label: '진행 중', variant: 'default' },
  COMPLETED: { label: '완료', variant: 'secondary' },
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<CampaignStatus | 'ALL'>('MATCHED');
  const [loading, setLoading] = useState(true);
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; campaign: Campaign | null }>({ open: false, campaign: null });
  const [imwebLink, setImwebLink] = useState('');
  const supabase = createClient();

  const fetchCampaigns = async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    let query = supabase
      .from('campaigns')
      .select('*, product:products(*, brand:profiles!products_brand_id_fkey(company_name)), influencer:profiles!campaigns_influencer_id_fkey(company_name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filter !== 'ALL') query = query.eq('status', filter);

    const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
    setCampaigns((data as Campaign[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, [page, filter]);

  const openLinkDialog = (campaign: Campaign) => {
    setImwebLink(campaign.imweb_link || '');
    setLinkDialog({ open: true, campaign });
  };

  const saveLinkAndActivate = async () => {
    if (!linkDialog.campaign) return;
    const updates: any = { imweb_link: imwebLink };
    if (linkDialog.campaign.status === 'MATCHED' && imwebLink) {
      updates.status = 'ONGOING';
    }

    const { error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', linkDialog.campaign.id);

    if (error) {
      toast.error('저장 실패');
    } else {
      if (imwebLink) {
        await createNotification(supabase, {
          userId: linkDialog.campaign.influencer_id,
          type: 'LINK_READY',
          title: '아임웹 링크가 등록되었습니다',
          message: `공구 링크가 준비되었습니다. 내 공구 페이지에서 확인해 주세요.`,
          referenceId: linkDialog.campaign.id,
        });
      }
      toast.success('저장되었습니다.');
      setLinkDialog({ open: false, campaign: null });
      fetchCampaigns();
    }
  };

  const handleComplete = async (campaignId: string) => {
    const { error } = await supabase
      .from('campaigns')
      .update({ status: 'COMPLETED' })
      .eq('id', campaignId);
    if (!error) {
      toast.success('캠페인이 완료 처리되었습니다.');
      fetchCampaigns();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">캠페인 관리</h1>

      <Tabs value={filter} onValueChange={(v) => { setFilter(v as any); setPage(1); }} className="mb-4">
        <TabsList>
          <TabsTrigger value="MATCHED">매칭 완료</TabsTrigger>
          <TabsTrigger value="ONGOING">진행 중</TabsTrigger>
          <TabsTrigger value="COMPLETED">완료</TabsTrigger>
          <TabsTrigger value="ALL">전체</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="text-gray-500">로딩 중...</p>
      ) : campaigns.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">캠페인이 없습니다.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const st = statusLabels[campaign.status];
            return (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{campaign.product?.name}</span>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        브랜드: {(campaign.product as any)?.brand?.company_name} · 인플루언서: {campaign.influencer?.company_name}
                        {campaign.commission_rate != null && ` · 수수료 ${campaign.commission_rate}%`}
                      </div>
                      {campaign.imweb_link && (
                        <p className="text-sm text-blue-600 mt-1 truncate">링크: {campaign.imweb_link}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(campaign.status === 'MATCHED' || campaign.status === 'ONGOING') && (
                        <Button size="sm" variant="outline" onClick={() => openLinkDialog(campaign)}>
                          {campaign.imweb_link ? '링크 수정' : '링크 등록'}
                        </Button>
                      )}
                      {campaign.status === 'ONGOING' && (
                        <Button size="sm" onClick={() => handleComplete(campaign.id)}>완료</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      )}

      <Dialog open={linkDialog.open} onOpenChange={(open) => setLinkDialog({ ...linkDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>아임웹 링크 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>아임웹 UTM 링크</Label>
            <Input
              value={imwebLink}
              onChange={(e) => setImwebLink(e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500">
              링크 등록 시 캠페인 상태가 자동으로 &apos;진행 중&apos;으로 변경됩니다.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialog({ open: false, campaign: null })}>취소</Button>
            <Button onClick={saveLinkAndActivate}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
