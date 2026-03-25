'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/pagination';
import { toast } from 'sonner';
import { createNotification } from '@/lib/notifications';
import { Search } from 'lucide-react';
import type { Product } from '@/types';

const PAGE_SIZE = 20;

export default function SourcingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'latest' | 'margin'>('latest');
  const [categories, setCategories] = useState<string[]>([]);
  const [pickDialog, setPickDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [desiredStart, setDesiredStart] = useState('');
  const [desiredEnd, setDesiredEnd] = useState('');
  const supabase = createClient();

  const fetchProducts = async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;

    let query = supabase
      .from('products')
      .select('*, brand:profiles!products_brand_id_fkey(company_name)', { count: 'exact' })
      .eq('status', 'APPROVED');

    if (search) query = query.ilike('name', `%${search}%`);
    if (category && category !== 'all') query = query.eq('category', category);

    if (sort === 'margin') {
      query = query.order('margin_rate', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
    setProducts((data as Product[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    supabase
      .from('products')
      .select('category')
      .eq('status', 'APPROVED')
      .not('category', 'is', null)
      .then(({ data }) => {
        const cats = [...new Set((data || []).map((d) => d.category).filter(Boolean))] as string[];
        setCategories(cats);
      });
  }, []);

  useEffect(() => { fetchProducts(); }, [page, search, category, sort]);

  const handlePick = async () => {
    if (!pickDialog.product) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('campaigns').insert({
      product_id: pickDialog.product.id,
      influencer_id: user.id,
      status: 'REQUESTED',
      desired_start_date: desiredStart || null,
      desired_end_date: desiredEnd || null,
    });

    if (error) {
      toast.error('요청 실패: ' + error.message);
    } else {
      await createNotification(supabase, {
        userId: pickDialog.product.brand_id,
        type: 'CAMPAIGN_REQUESTED',
        title: '새로운 공구 요청이 접수되었습니다',
        message: `${pickDialog.product.name} 상품에 대한 공구 요청`,
        referenceId: pickDialog.product.id,
      });
      toast.success('공구 요청이 접수되었습니다.');
      setPickDialog({ open: false, product: null });
      setDesiredStart('');
      setDesiredEnd('');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">상품 소싱</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="상품명 검색..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v ?? 'all'); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort((v ?? 'latest') as 'latest' | 'margin')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">최신순</SelectItem>
            <SelectItem value="margin">마진율순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-gray-500">로딩 중...</p>
      ) : products.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">소싱 가능한 상품이 없습니다.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardContent className="flex-1 p-4">
                <div className="mb-2">
                  {product.category && <Badge variant="outline" className="mb-2">{product.category}</Badge>}
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{(product.brand as any)?.company_name}</p>
                </div>
                <div className="space-y-1 text-sm">
                  <p>판매가: <span className="font-medium">{Number(product.price).toLocaleString()}원</span></p>
                  <p>마진율: <span className="font-medium text-blue-600">{product.margin_rate}%</span></p>
                  {product.desired_period_start && (
                    <p>희망 기간: {product.desired_period_start} ~ {product.desired_period_end}</p>
                  )}
                </div>
                {product.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                )}
                <Button
                  className="w-full mt-4"
                  onClick={() => setPickDialog({ open: true, product })}
                >
                  공구 요청하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />

      <Dialog open={pickDialog.open} onOpenChange={(open) => setPickDialog({ ...pickDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공구 요청 - {pickDialog.product?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>희망 시작일</Label>
              <Input type="date" value={desiredStart} onChange={(e) => setDesiredStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>희망 종료일</Label>
              <Input type="date" value={desiredEnd} onChange={(e) => setDesiredEnd(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPickDialog({ open: false, product: null })}>취소</Button>
            <Button onClick={handlePick}>요청하기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
