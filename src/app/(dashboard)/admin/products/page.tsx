'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/pagination';
import { toast } from 'sonner';
import { createNotification } from '@/lib/notifications';
import type { Product, ProductStatus } from '@/types';

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ProductStatus | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; productId: string }>({ open: false, productId: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const supabase = createClient();

  const fetchProducts = async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    let query = supabase
      .from('products')
      .select('*, brand:profiles!products_brand_id_fkey(company_name, contact_email)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filter !== 'ALL') query = query.eq('status', filter);

    const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
    setProducts((data as Product[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [page, filter]);

  const handleApprove = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ status: 'APPROVED' })
      .eq('id', product.id);

    if (!error) {
      await createNotification(supabase, {
        userId: product.brand_id,
        type: 'PRODUCT_APPROVED',
        title: '상품이 승인되었습니다',
        message: `${product.name} 상품이 승인되었습니다.`,
        referenceId: product.id,
      });
      toast.success('승인 처리되었습니다.');
      fetchProducts();
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('반려 사유를 입력해 주세요.');
      return;
    }
    const product = products.find((p) => p.id === rejectDialog.productId);
    const { error } = await supabase
      .from('products')
      .update({ status: 'REJECTED', rejection_reason: rejectReason })
      .eq('id', rejectDialog.productId);

    if (!error && product) {
      await createNotification(supabase, {
        userId: product.brand_id,
        type: 'PRODUCT_REJECTED',
        title: '상품이 반려되었습니다',
        message: `${product.name} - 사유: ${rejectReason}`,
        referenceId: product.id,
      });
      toast.success('반려 처리되었습니다.');
      setRejectDialog({ open: false, productId: '' });
      setRejectReason('');
      fetchProducts();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">상품 검수</h1>

      <Tabs value={filter} onValueChange={(v) => { setFilter(v as any); setPage(1); }} className="mb-4">
        <TabsList>
          <TabsTrigger value="PENDING">검수 대기</TabsTrigger>
          <TabsTrigger value="APPROVED">승인 완료</TabsTrigger>
          <TabsTrigger value="REJECTED">반려</TabsTrigger>
          <TabsTrigger value="ALL">전체</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="text-gray-500">로딩 중...</p>
      ) : products.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">상품이 없습니다.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => setDetailProduct(product)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant={product.status === 'APPROVED' ? 'default' : product.status === 'REJECTED' ? 'destructive' : 'outline'}>
                        {product.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {(product.brand as any)?.company_name} · {Number(product.price).toLocaleString()}원 · 마진율 {product.margin_rate}%
                    </div>
                  </div>
                  {product.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(product)}>승인</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setRejectDialog({ open: true, productId: product.id })}
                      >
                        반려
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailProduct} onOpenChange={() => setDetailProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailProduct?.name}</DialogTitle>
          </DialogHeader>
          {detailProduct && (
            <div className="space-y-3 text-sm">
              <p><strong>브랜드:</strong> {(detailProduct.brand as any)?.company_name}</p>
              <p><strong>판매가:</strong> {Number(detailProduct.price).toLocaleString()}원</p>
              <p><strong>마진율:</strong> {detailProduct.margin_rate}%</p>
              <p><strong>카테고리:</strong> {detailProduct.category || '-'}</p>
              <p><strong>희망 기간:</strong> {detailProduct.desired_period_start || '-'} ~ {detailProduct.desired_period_end || '-'}</p>
              <p><strong>설명:</strong> {detailProduct.description || '-'}</p>
              {detailProduct.asset_url && (
                <p><strong>에셋:</strong> 업로드됨</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}>
        <DialogContent>
          <DialogHeader><DialogTitle>반려 사유 입력</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>반려 사유 *</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="반려 사유를 입력해 주세요" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, productId: '' })}>취소</Button>
            <Button variant="destructive" onClick={handleReject}>반려</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
