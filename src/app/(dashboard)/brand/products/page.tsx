'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/pagination';
import { Plus } from 'lucide-react';
import type { Product } from '@/types';

const PAGE_SIZE = 20;

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  DRAFT: { label: '임시저장', variant: 'secondary' },
  PENDING: { label: '검수 중', variant: 'outline' },
  APPROVED: { label: '승인 완료', variant: 'default' },
  REJECTED: { label: '반려', variant: 'destructive' },
};

export default function BrandProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProducts = async (p: number) => {
    setLoading(true);
    const from = (p - 1) * PAGE_SIZE;
    const { data, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    setProducts((data as Product[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(page); }, [page]);

  const handleResubmit = async (productId: string) => {
    await supabase.from('products').update({ status: 'PENDING', rejection_reason: null }).eq('id', productId);
    fetchProducts(page);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <Link href="/brand/products/new">
          <Button><Plus className="mr-2 h-4 w-4" />상품 등록</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">로딩 중...</p>
      ) : products.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">등록된 상품이 없습니다.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {
            const st = statusLabels[product.status];
            return (
              <Card key={product.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Number(product.price).toLocaleString()}원 · 마진율 {product.margin_rate}%
                      {product.category && ` · ${product.category}`}
                    </div>
                    {product.rejection_reason && (
                      <p className="text-sm text-red-500 mt-1">반려 사유: {product.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {product.status === 'REJECTED' && (
                      <Button size="sm" onClick={() => handleResubmit(product.id)}>
                        재심사 요청
                      </Button>
                    )}
                    {(product.status === 'DRAFT' || product.status === 'REJECTED') && (
                      <Link href={`/brand/products/new?edit=${product.id}`}>
                        <Button size="sm" variant="outline">수정</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
