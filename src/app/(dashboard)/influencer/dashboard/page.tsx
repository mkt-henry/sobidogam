'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import type { DailyRecord } from '@/types';

interface ChartData {
  date: string;
  sales: number;
  commission: number;
  orders: number;
}

export default function InfluencerDashboardPage() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: records } = await supabase
        .from('daily_records')
        .select('*, campaigns!inner(influencer_id)')
        .eq('campaigns.influencer_id', user.id)
        .order('record_date', { ascending: true });

      if (!records || records.length === 0) {
        setLoading(false);
        return;
      }

      const byDate = new Map<string, ChartData>();
      let ts = 0, tc = 0, to = 0;

      for (const r of records as DailyRecord[]) {
        const date = r.record_date;
        const existing = byDate.get(date) || { date, sales: 0, commission: 0, orders: 0 };
        existing.sales += Number(r.total_sales_amount);
        existing.commission += Number(r.influencer_commission);
        existing.orders += r.order_count;
        byDate.set(date, existing);

        ts += Number(r.total_sales_amount);
        tc += Number(r.influencer_commission);
        to += r.order_count;
      }

      setChartData(Array.from(byDate.values()));
      setTotalSales(ts);
      setTotalCommission(tc);
      setTotalOrders(to);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-6">로딩 중...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">실적 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">총 판매액</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalSales.toLocaleString()}원</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">총 수수료</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{totalCommission.toLocaleString()}원</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">총 주문 건수</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalOrders.toLocaleString()}건</div></CardContent>
        </Card>
      </div>

      {chartData.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">실적 데이터가 없습니다.</CardContent></Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader><CardTitle>일별 판매액 / 수수료</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="판매액" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="commission" name="수수료" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>일별 주문 건수</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="orders" name="주문 건수" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
