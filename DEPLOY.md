# 소비도감 - 배포 가이드

## 환경 변수 (.env.local / Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Supabase 설정

1. [Supabase 대시보드](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. Authentication > Email 인증 활성화
4. Settings에서 URL, Anon Key, Service Role Key 확인

## Vercel 배포

1. GitHub 레포 연결
2. Environment Variables에 위 3개 값 설정
3. Deploy
