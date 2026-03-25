import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, CreditCard, Users, Clock, CheckCircle } from 'lucide-react';
import type { Profile } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  let role = 'ADMIN';
  let userId = 'dev-user';

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profile) role = (profile as Profile).role;
    }
  } catch {
    // 인증 없이 기본값 사용
  }

  if (role === 'BRAND') return <BrandDashboard userId={userId} />;
  if (role === 'INFLUENCER') return <InfluencerDashboard userId={userId} />;
  return <AdminDashboard />;
}

async function BrandDashboard({ userId }: { userId: string }) {
  const supabase = await createClient();

  const [products, campaigns, pendingCampaigns] = await Promise.all([
    supabase.from('products').select('id, status', { count: 'exact' }).eq('brand_id', userId),
    supabase.from('campaigns').select('id, product_id, status, products!inner(brand_id)').eq('products.brand_id', userId),
    supabase.from('campaigns').select('id, product_id, status, products!inner(brand_id)').eq('products.brand_id', userId).eq('status', 'REQUESTED'),
  ]);

  const productCount = products.count || 0;
  const approvedCount = products.data?.filter((p) => p.status === 'APPROVED').length || 0;
  const campaignCount = campaigns.data?.length || 0;
  const pendingCount = pendingCampaigns.data?.length || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">브랜드 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="전체 상품" value={productCount} />
        <StatCard icon={CheckCircle} label="승인된 상품" value={approvedCount} />
        <StatCard icon={ShoppingBag} label="진행 중 캠페인" value={campaignCount} />
        <StatCard icon={Clock} label="매칭 대기" value={pendingCount} color="text-orange-600" />
      </div>
    </div>
  );
}

async function InfluencerDashboard({ userId }: { userId: string }) {
  const supabase = await createClient();

  const [campaigns, records] = await Promise.all([
    supabase.from('campaigns').select('id, status', { count: 'exact' }).eq('influencer_id', userId),
    supabase.from('daily_records').select('total_sales_amount, influencer_commission, campaign_id, campaigns!inner(influencer_id)')
      .eq('campaigns.influencer_id', userId),
  ]);

  const totalCampaigns = campaigns.count || 0;
  const ongoingCount = campaigns.data?.filter((c) => c.status === 'ONGOING').length || 0;
  const totalSales = records.data?.reduce((sum, r) => sum + Number(r.total_sales_amount), 0) || 0;
  const totalCommission = records.data?.reduce((sum, r) => sum + Number(r.influencer_commission), 0) || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">인플루언서 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="전체 공구" value={totalCampaigns} />
        <StatCard icon={Clock} label="진행 중" value={ongoingCount} color="text-green-600" />
        <StatCard icon={CreditCard} label="총 판매액" value={`${totalSales.toLocaleString()}원`} />
        <StatCard icon={CreditCard} label="총 수수료" value={`${totalCommission.toLocaleString()}원`} color="text-blue-600" />
      </div>
    </div>
  );
}

async function AdminDashboard() {
  const supabase = await createClient();

  const [pendingProducts, requestedCampaigns, users, ongoingCampaigns] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact' }).eq('status', 'PENDING'),
    supabase.from('campaigns').select('id', { count: 'exact' }).eq('status', 'REQUESTED'),
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('campaigns').select('id', { count: 'exact' }).eq('status', 'ONGOING'),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="승인 대기 상품" value={pendingProducts.count || 0} color="text-orange-600" />
        <StatCard icon={ShoppingBag} label="매칭 대기 캠페인" value={requestedCampaigns.count || 0} color="text-orange-600" />
        <StatCard icon={Clock} label="진행 중 캠페인" value={ongoingCampaigns.count || 0} color="text-green-600" />
        <StatCard icon={Users} label="전체 사용자" value={users.count || 0} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
        <Icon className={`h-5 w-5 ${color || 'text-gray-400'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color || ''}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
