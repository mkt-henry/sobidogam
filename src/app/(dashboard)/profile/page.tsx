'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Profile } from '@/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data as Profile);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        company_name: profile.company_name,
        contact_email: profile.contact_email,
        phone: profile.phone,
        bank_name: profile.bank_name,
        bank_account: profile.bank_account,
        account_holder: profile.account_holder,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('저장에 실패했습니다.');
    } else {
      toast.success('프로필이 저장되었습니다.');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6">로딩 중...</div>;
  if (!profile) return null;

  const update = (field: keyof Profile, value: string) =>
    setProfile({ ...profile, [field]: value });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">프로필 설정</h1>
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{profile.role === 'BRAND' ? '회사명' : '활동명'}</Label>
            <Input
              value={profile.company_name || ''}
              onChange={(e) => update('company_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>연락용 이메일</Label>
            <Input
              type="email"
              value={profile.contact_email || ''}
              onChange={(e) => update('contact_email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>연락처</Label>
            <Input
              value={profile.phone || ''}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="010-0000-0000"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>정산 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>은행명</Label>
            <Input
              value={profile.bank_name || ''}
              onChange={(e) => update('bank_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>계좌번호</Label>
            <Input
              value={profile.bank_account || ''}
              onChange={(e) => update('bank_account', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>예금주</Label>
            <Input
              value={profile.account_holder || ''}
              onChange={(e) => update('account_holder', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="mt-4 w-full" disabled={saving}>
        {saving ? '저장 중...' : '저장'}
      </Button>
    </div>
  );
}
