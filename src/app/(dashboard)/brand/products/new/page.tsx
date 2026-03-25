'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, '상품명을 입력해 주세요'),
  price: z.string().min(1, '판매가를 입력해 주세요'),
  margin_rate: z.string().min(1, '마진율을 입력해 주세요'),
  category: z.string().optional(),
  description: z.string().optional(),
  desired_period_start: z.string().optional(),
  desired_period_end: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function NewProductPage() {
  return (
    <Suspense>
      <NewProductForm />
    </Suspense>
  );
}

function NewProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { margin_rate: '10', price: '' },
  });

  useEffect(() => {
    if (editId) {
      supabase
        .from('products')
        .select('*')
        .eq('id', editId)
        .single()
        .then(({ data }) => {
          if (data) {
            reset({
              name: data.name,
              price: String(data.price),
              margin_rate: String(data.margin_rate ?? 10),
              category: data.category || '',
              description: data.description || '',
              desired_period_start: data.desired_period_start || '',
              desired_period_end: data.desired_period_end || '',
            });
          }
        });
    }
  }, [editId]);

  const onSubmit = async (values: ProductForm, status: 'DRAFT' | 'PENDING') => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let asset_url: string | null = null;
    if (file) {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('assets').upload(path, file);
      if (uploadError) {
        toast.error('파일 업로드 실패: ' + uploadError.message);
        setUploading(false);
        return;
      }
      asset_url = path;
    }

    const productData = {
      name: values.name,
      price: Number(values.price),
      margin_rate: Number(values.margin_rate),
      category: values.category || null,
      description: values.description || null,
      brand_id: user.id,
      status,
      ...(asset_url && { asset_url }),
      desired_period_start: values.desired_period_start || null,
      desired_period_end: values.desired_period_end || null,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from('products').update(productData).eq('id', editId));
    } else {
      ({ error } = await supabase.from('products').insert(productData));
    }

    if (error) {
      toast.error('저장 실패: ' + error.message);
    } else {
      toast.success(status === 'DRAFT' ? '임시 저장되었습니다.' : '검수 요청이 제출되었습니다.');
      router.push('/brand/products');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{editId ? '상품 수정' : '상품 등록'}</h1>
      <Card>
        <CardHeader>
          <CardTitle>상품 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>상품명 *</Label>
              <Input {...register('name')} placeholder="상품명을 입력하세요" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>판매가 (원) *</Label>
                <Input type="number" {...register('price')} placeholder="0" />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>제안 마진율 (%) *</Label>
                <Input type="number" step="0.1" {...register('margin_rate')} />
                {errors.margin_rate && <p className="text-sm text-red-500">{errors.margin_rate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>카테고리</Label>
              <Input {...register('category')} placeholder="예: 뷰티, 식품, 패션" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>희망 공구 시작일</Label>
                <Input type="date" {...register('desired_period_start')} />
              </div>
              <div className="space-y-2">
                <Label>희망 공구 종료일</Label>
                <Input type="date" {...register('desired_period_end')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>상세 설명</Label>
              <Textarea {...register('description')} rows={4} placeholder="상품에 대한 상세 설명" />
            </div>

            <div className="space-y-2">
              <Label>에셋 파일 (이미지/ZIP/PDF, 최대 50MB)</Label>
              <Input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.zip,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={handleSubmit((v) => onSubmit(v, 'DRAFT'))}
              >
                임시 저장
              </Button>
              <Button
                type="button"
                disabled={uploading}
                onClick={handleSubmit((v) => onSubmit(v, 'PENDING'))}
              >
                {uploading ? '제출 중...' : '검수 요청'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
