'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/pagination';
import { toast } from 'sonner';
import { Copy, ExternalLink } from 'lucide-react';
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

export default function InfluencerCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCampaigns = async (p: number) => {
    setLoading(true);
    const from = (p - 1) * PAGE_SIZE;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, count } = await supabase
      .from('campaigns')
      .select('*, product:products(*, brand:profiles!products_brand_id_fkey(company_name))', { count: 'exact' })
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    setCampaigns((data as Campaign[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(page); }, [page]);

  const handleCancel = async (campaignId: string) => {
    const { error } = await supabase
      .from('campaigns')
      .update({ status: 'CANCELLED' })
      .eq('id', campaignId);

    if (error) {
      toast.error('취소 실패');
    } else {
      toast.success('공구 요청이 취소되었습니다.');
      fetchCampaigns(page);
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('링크가 복사되었습니다.');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">내 공구 관리</h1>

      {loading ? (
        <p className="text-gray-500">로딩 중...</p>
      ) : campaigns.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">진행 중인 공구가 없습니다.</CardContent></Card>
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
                        {(campaign.product as any)?.brand?.company_name}
                        {campaign.commission_rate != null && ` · 수수료 ${campaign.commission_rate}%`}
                        {campaign.start_date && ` · ${campaign.start_date} ~ ${campaign.end_date}`}
                      </div>
                      {campaign.rejection_reason && (
                        <p className="text-sm text-red-500 mt-1">거절 사유: {campaign.rejection_reason}</p>
                      )}
                      {campaign.imweb_link && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-lg">
                          <ExternalLink className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-blue-700 truncate flex-1">{campaign.imweb_link}</span>
                          <Button size="sm" variant="outline" onClick={() => copyLink(campaign.imweb_link!)}>
                            <Copy className="h-3 w-3 mr-1" />복사
                          </Button>
                        </div>
                      )}
                    </div>
                    {campaign.status === 'REQUESTED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(campaign.id)}
                      >
                        취소
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
