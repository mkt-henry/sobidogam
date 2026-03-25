'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/pagination';
import { toast } from 'sonner';
import { createNotification } from '@/lib/notifications';
import type { Campaign } from '@/types';

const PAGE_SIZE = 20;

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  REQUESTED: { label: '요청 대기', variant: 'outline' },
  MATCHED: { label: '매칭 완료', variant: 'default' },
  REJECTED: { label: '거절', variant: 'destructive' },
  CANCELLED: { label: '취소', variant: 'secondary' },
  ONGOING: { label: '진행 중', variant: 'default' },
  COMPLETED: { label: '완료', variant: 'secondary' },
};

export default function BrandCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; campaignId: string }>({ open: false, campaignId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const supabase = createClient();

  const fetchCampaigns = async (p: number) => {
    setLoading(true);
    const from = (p - 1) * PAGE_SIZE;
    const { data, count } = await supabase
      .from('campaigns')
      .select('*, product:products(*), influencer:profiles!campaigns_influencer_id_fkey(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    setCampaigns((data as Campaign[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(page); }, [page]);

  const handleAccept = async (campaign: Campaign) => {
    const { error } = await supabase
      .from('campaigns')
      .update({
        status: 'MATCHED',
        commission_rate: campaign.product?.margin_rate || 0,
        start_date: campaign.desired_start_date,
        end_date: campaign.desired_end_date,
      })
      .eq('id', campaign.id);

    if (error) {
      toast.error('처리 실패');
    } else {
      await createNotification(supabase, {
        userId: campaign.influencer_id,
        type: 'CAMPAIGN_MATCHED',
        title: '공구 매칭이 수락되었습니다',
        message: `${campaign.product?.name} 상품의 공구 요청이 수락되었습니다.`,
        referenceId: campaign.id,
      });
      toast.success('매칭을 수락했습니다.');
      fetchCampaigns(page);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('거절 사유를 입력해 주세요.');
      return;
    }
    const campaign = campaigns.find((c) => c.id === rejectDialog.campaignId);
    const { error } = await supabase
      .from('campaigns')
      .update({ status: 'REJECTED', rejection_reason: rejectReason })
      .eq('id', rejectDialog.campaignId);

    if (error) {
      toast.error('처리 실패');
    } else {
      if (campaign) {
        await createNotification(supabase, {
          userId: campaign.influencer_id,
          type: 'CAMPAIGN_REJECTED',
          title: '공구 요청이 거절되었습니다',
          message: `사유: ${rejectReason}`,
          referenceId: campaign.id,
        });
      }
      toast.success('거절 처리되었습니다.');
      setRejectDialog({ open: false, campaignId: '' });
      setRejectReason('');
      fetchCampaigns(page);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">매칭 관리</h1>

      {loading ? (
        <p className="text-gray-500">로딩 중...</p>
      ) : campaigns.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">매칭 요청이 없습니다.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const st = statusLabels[campaign.status];
            return (
              <Card key={campaign.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{campaign.product?.name}</span>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        인플루언서: {campaign.influencer?.company_name || '미지정'}
                        {campaign.desired_start_date && ` · 희망 기간: ${campaign.desired_start_date} ~ ${campaign.desired_end_date}`}
                      </div>
                      {campaign.rejection_reason && (
                        <p className="text-sm text-red-500 mt-1">거절 사유: {campaign.rejection_reason}</p>
                      )}
                    </div>
                    {campaign.status === 'REQUESTED' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAccept(campaign)}>수락</Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectDialog({ open: true, campaignId: campaign.id })}
                        >
                          거절
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      )}

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>거절 사유 입력</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>거절 사유 *</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="거절 사유를 입력해 주세요"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, campaignId: '' })}>취소</Button>
            <Button variant="destructive" onClick={handleReject}>거절</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
