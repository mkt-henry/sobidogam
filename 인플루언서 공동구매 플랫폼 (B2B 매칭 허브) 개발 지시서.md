# 인플루언서 공동구매 플랫폼 (B2B 매칭 허브) 개발 지시서

본 문서는 클로드 코드(Claude Code)가 인플루언서 공동구매 플랫폼의 MVP를 구축하기 위한 종합 개발 지시서입니다. 이 문서의 내용을 바탕으로 프로젝트 스캐폴딩부터 DB 설계, API 구현, 프론트엔드 화면까지 전체 시스템을 구축해 주세요.

---

## 1. 프로젝트 개요 및 아키텍처

본 플랫폼은 **브랜드(공급사)와 인플루언서(셀러)를 매칭**하고, **공구 실적을 관리**하는 B2B 허브입니다. 실제 소비자의 결제와 상세페이지는 외부 솔루션(아임웹)을 사용하므로, 본 플랫폼은 결제/장바구니 기능 없이 **매칭과 데이터 연동**에 집중합니다.

### 1.1. 기술 스택 (Supabase + Vercel)
* **Frontend & Framework:** Next.js (App Router), React, TypeScript
* **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide Icons
* **Backend (BaaS):** Supabase (PostgreSQL Database, Authentication, Storage)
* **Deployment:** Vercel
* **Data Fetching:** `@supabase/ssr` 및 Supabase Client
* **Form Validation:** `zod` + `react-hook-form`
* **Excel Parsing:** `xlsx` (SheetJS) — 관리자 페이지에서만 dynamic import로 로드
* **Charts:** `recharts` — 실적 대시보드 그래프용

### 1.2. 핵심 사용자 권한 (Role)
사용자 권한은 **`profiles` 테이블의 `role` 컬럼**을 통해 관리합니다. (`user_metadata`가 아닌 DB 기반으로 관리하여 클라이언트에서 임의 변경 불가)

| Role | 주요 역할 |
|------|-----------|
| **`BRAND`** | 자사 상품 등록 요청, 매칭 승인, 정산 내역 확인 |
| **`INFLUENCER`** | 상품 소싱(Pick), 공구 링크 확인, 실적 대시보드 확인 |
| **`ADMIN`** | 상품 검수 및 승인, 아임웹 링크 등록, 실적 엑셀 업로드, 정산 관리 |

> **주의:** 회원가입 시 선택 가능한 Role은 `BRAND`와 `INFLUENCER`만 허용합니다. `ADMIN` 권한은 기존 ADMIN이 직접 부여하거나 DB에서 직접 설정합니다.

---

## 2. 데이터베이스 스키마 설계 (Supabase PostgreSQL)

Supabase SQL Editor에서 실행할 수 있도록 테이블을 설계해 주세요. Row Level Security (RLS) 정책 적용이 필수입니다.

### 2.1. 주요 테이블 구조

* **`profiles`**: Supabase Auth `auth.users`와 1:1 매핑되는 사용자 정보
  * `id` (uuid, PK, references auth.users)
  * `role` (text, CHECK: 'BRAND', 'INFLUENCER', 'ADMIN')
  * `company_name` (text)
  * `contact_email` (text) — 연락용 이메일
  * `phone` (text) — 연락처
  * `bank_name` (text) — 정산용 은행명
  * `bank_account` (text) — 정산용 계좌번호
  * `account_holder` (text) — 예금주
  * `status` (text, CHECK: 'ACTIVE', 'SUSPENDED', default 'ACTIVE') — 사용자 활성 상태
  * `created_at` (timestamptz)
  * `updated_at` (timestamptz)

* **`products`**: 브랜드가 등록 요청한 상품 정보
  * `id` (uuid, PK)
  * `brand_id` (uuid, FK to profiles)
  * `name` (text)
  * `description` (text)
  * `price` (numeric, NOT NULL) — 판매가 (정산 계산의 기준)
  * `margin_rate` (numeric, CHECK: 0~100) — 제안 마진율(%)
  * `category` (text) — 상품 카테고리 (소싱 리스트 필터용)
  * `desired_period_start` (date) — 희망 공구 시작일
  * `desired_period_end` (date) — 희망 공구 종료일
  * `status` (text, CHECK: 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED')
  * `rejection_reason` (text) — 반려 시 사유
  * `asset_url` (text) — Supabase Storage 링크
  * `created_at` (timestamptz)
  * `updated_at` (timestamptz)
  * **INDEX**: `status` (인플루언서 소싱 쿼리 최적화)

* **`campaigns`**: 인플루언서가 특정 상품을 Pick하여 성사된 공구
  * `id` (uuid, PK)
  * `product_id` (uuid, FK to products)
  * `influencer_id` (uuid, FK to profiles)
  * `status` (text, CHECK: 'REQUESTED', 'MATCHED', 'REJECTED', 'CANCELLED', 'ONGOING', 'COMPLETED')
  * `rejection_reason` (text) — 거절 시 사유
  * `desired_start_date` (date) — 인플루언서가 희망한 시작일
  * `desired_end_date` (date) — 인플루언서가 희망한 종료일
  * `start_date` (date) — 확정된 시작일
  * `end_date` (date) — 확정된 종료일
  * `commission_rate` (numeric) — 캠페인별 확정 수수료율 (매칭 시 상품 margin_rate에서 복사하여 스냅샷)
  * `imweb_link` (text) — 관리자가 등록하는 아임웹 UTM 링크
  * `created_at` (timestamptz)
  * `updated_at` (timestamptz)
  * **INDEX**: `influencer_id`, `product_id`

* **`daily_records`**: 관리자가 아임웹 엑셀을 업로드하여 기록되는 실적
  * `id` (uuid, PK)
  * `campaign_id` (uuid, FK to campaigns)
  * `upload_batch_id` (uuid, FK to excel_uploads) — 어떤 업로드에서 생성되었는지 추적
  * `uploaded_by` (uuid, FK to profiles) — 업로드한 관리자
  * `record_date` (date)
  * `order_count` (integer)
  * `cancel_count` (integer, default 0) — 취소 건수
  * `total_sales_amount` (numeric)
  * `refund_amount` (numeric, default 0) — 환불 금액
  * `influencer_commission` (numeric) — 계산식: `(total_sales_amount - refund_amount) × campaign.commission_rate / 100`
  * `created_at` (timestamptz)
  * **UNIQUE CONSTRAINT**: `(campaign_id, record_date)` — 동일 캠페인의 같은 날짜 중복 방지

* **`settlements`**: 정산 관리
  * `id` (uuid, PK)
  * `campaign_id` (uuid, FK to campaigns)
  * `period_start` (date) — 정산 대상 기간 시작
  * `period_end` (date) — 정산 대상 기간 종료
  * `total_sales` (numeric) — 기간 내 총 판매액
  * `total_refunds` (numeric) — 기간 내 총 환불액
  * `influencer_payout` (numeric) — 인플루언서 지급 예정액
  * `brand_payout` (numeric) — 브랜드 지급 예정액
  * `platform_fee` (numeric) — 플랫폼 수수료
  * `status` (text, CHECK: 'PENDING', 'CONFIRMED', 'PAID')
  * `settled_at` (timestamptz) — 실제 지급 완료일
  * `created_at` (timestamptz)

* **`excel_uploads`**: 엑셀 업로드 이력 관리
  * `id` (uuid, PK)
  * `uploaded_by` (uuid, FK to profiles)
  * `file_name` (text)
  * `file_url` (text) — Storage에 보관된 원본 파일
  * `total_rows` (integer) — 전체 행 수
  * `matched_rows` (integer) — 매핑 성공 행 수
  * `unmatched_rows` (integer) — 매핑 실패 행 수
  * `status` (text, CHECK: 'PROCESSING', 'COMPLETED', 'FAILED')
  * `error_message` (text) — 실패 시 에러 내용
  * `created_at` (timestamptz)

* **`notifications`**: 인앱 알림
  * `id` (uuid, PK)
  * `user_id` (uuid, FK to profiles)
  * `type` (text) — 알림 유형 (PRODUCT_APPROVED, PRODUCT_REJECTED, CAMPAIGN_REQUESTED, CAMPAIGN_MATCHED, CAMPAIGN_REJECTED, LINK_READY, RECORDS_UPLOADED)
  * `title` (text)
  * `message` (text)
  * `reference_id` (uuid) — 관련 엔티티 ID (상품/캠페인)
  * `is_read` (boolean, default false)
  * `created_at` (timestamptz)
  * **INDEX**: `user_id`, `is_read`

### 2.2. Row Level Security (RLS) 정책 가이드

* **`profiles`**: 누구나 자신의 프로필 읽기/수정 가능. ADMIN은 모두 읽기/수정 가능.
* **`products`**: BRAND는 자신의 상품만 CRUD. INFLUENCER는 `status = 'APPROVED'`인 상품만 Read. ADMIN은 모두 CRUD.
* **`campaigns`**: BRAND는 자신의 상품이 포함된 캠페인만 Read/Update. INFLUENCER는 자신의 캠페인만 Read/Update. ADMIN은 모두 CRUD.
* **`daily_records`**: ADMIN은 전체 CRUD. BRAND는 자사 상품 연결 캠페인의 레코드만 Read. INFLUENCER는 자기 캠페인의 레코드만 Read. 일반 사용자 Write 불가.
* **`settlements`**: ADMIN은 전체 CRUD. BRAND는 자사 상품 관련 정산만 Read. INFLUENCER는 자기 캠페인 정산만 Read.
* **`excel_uploads`**: ADMIN만 전체 CRUD. 다른 Role은 접근 불가.
* **`notifications`**: 자기 알림만 Read/Update(읽음 처리). ADMIN은 모든 알림 CRUD(발송용).

### 2.3. Supabase Storage 버킷 정책

* **`assets` 버킷**: private 설정
  * 업로드: BRAND만 가능 (자사 상품 에셋)
  * 다운로드: ADMIN + 해당 상품의 BRAND
  * 허용 MIME 타입: `image/png`, `image/jpeg`, `image/webp`, `application/zip`, `application/pdf`
  * 최대 파일 크기: 50MB

---

## 3. 화면 및 기능 요구사항

### 3.1. 공통 화면
* **로그인/회원가입:** Supabase Auth UI 활용. 가입 시 Role(**브랜드/인플루언서만** 선택 가능). 이메일 인증 필수.
* **대시보드 (메인):** Role에 따라 다른 위젯 노출 (브랜드: 내 상품 현황 / 인플루언서: 내 공구 실적 / 관리자: 승인 대기 건수)
* **알림 센터:** 헤더에 알림 아이콘(읽지 않은 알림 수 배지). 클릭 시 알림 목록 드롭다운.
* **모든 목록 화면에 페이지네이션 적용** (기본 20건/페이지)

### 3.2. 브랜드 (BRAND) 화면
* **상품 등록 요청 (`/brand/products/new`):**
  * 폼 입력: 상품명, **판매가**, 제안 마진율(%), 카테고리, 희망 공구 기간(시작일~종료일), 상세 설명
  * 파일 업로드: 상세페이지 제작용 에셋 압축 파일을 **Supabase Storage**에 업로드 후 URL 저장
  * `zod`를 통한 폼 유효성 검증 적용
* **내 상품 관리 (`/brand/products`):** 등록한 상품의 상태(임시저장, 검수 중, 승인 완료, 반려) 확인. **반려된 상품은 수정 후 재심사 요청 가능** (`REJECTED → PENDING`)
* **매칭 관리 (`/brand/campaigns`):** 인플루언서의 공구 요청 목록 확인 및 수락/거절. **거절 시 사유 입력 필수**.
* **정산 대시보드 (`/brand/settlements`):** 진행 중/완료된 공구의 총 판매액 및 정산 예정액 확인

### 3.3. 인플루언서 (INFLUENCER) 화면
* **상품 소싱 리스트 (`/influencer/sourcing`):**
  * 관리자가 승인한(`status: 'APPROVED'`) 상품 목록 조회
  * **카테고리 필터, 검색(상품명), 정렬(최신순/마진율순)** 기능
  * '공구 요청하기(Pick)' 버튼 클릭 시 희망 일정 입력 후 `campaigns` 테이블에 `REQUESTED` 상태로 insert
* **내 공구 관리 (`/influencer/campaigns`):**
  * 매칭 완료된 공구 목록 확인
  * **핵심 기능:** 관리자가 세팅한 **아임웹 전용 링크(`imweb_link`) 복사 버튼**
  * `REQUESTED` 상태에서 **취소 가능** (`REQUESTED → CANCELLED`)
* **실적 대시보드 (`/influencer/dashboard`):** 내 링크를 통해 발생한 일별/누적 판매 건수 및 예상 수수료 그래프 (`recharts` 사용)

### 3.4. 관리자 (ADMIN) 화면 (Back-office)
* **상품 검수 (`/admin/products`):** 브랜드가 올린 상품 및 에셋 확인 후 승인(`APPROVED`) 또는 반려(`REJECTED`, **반려 사유 입력 필수**) 처리
* **캠페인(공구) 관리 (`/admin/campaigns`):**
  * 매칭이 성사된 캠페인 목록 확인
  * **핵심 기능:** 아임웹에 상세페이지를 만든 후, 해당 캠페인에 **아임웹 UTM 링크(`imweb_link`) 입력 및 저장**
* **실적 데이터 업로드 (`/admin/records`):**
  * 아임웹에서 다운로드한 판매 엑셀 파일(주문일, 결제액, UTM ref 값 포함)을 업로드
  * **업로드 흐름:**
    1. 브라우저에서 `xlsx` 라이브러리로 파일 파싱 (미리보기 표시)
    2. ref 값 기반 캠페인 매핑 결과를 **미리보기로 확인** (매핑 성공/실패 건수 표시)
    3. 확인 후 **Next.js Server Action**으로 전송 → 서버에서 `service_role` 키로 `daily_records`에 bulk insert
    4. 매핑 실패 행은 별도 표시하여 관리자가 수동 확인 가능
  * 업로드 이력은 `excel_uploads` 테이블에 기록
  * **중복 방지:** `(campaign_id, record_date)` UNIQUE 제약으로 동일 날짜 재업로드 시 에러 (덮어쓰기 옵션 제공)
* **정산 관리 (`/admin/settlements`):** 캠페인별 정산 생성, 확인, 지급 완료 처리
* **사용자 관리 (`/admin/users`):** 사용자 목록 조회, ADMIN 권한 부여, 사용자 정지(SUSPENDED) 처리

---

## 4. 핵심 비즈니스 로직 및 주의사항

### 4.1. 결제 모듈 제외
이 플랫폼에는 PG사 연동이나 장바구니 기능이 없습니다. 소비자는 관리자가 세팅한 아임웹 링크로 이동하여 결제합니다.

### 4.2. 엑셀 파싱 로직
* 브라우저에서 `xlsx` 라이브러리로 파싱하여 **미리보기** 제공
* 실제 DB insert는 **Next.js Server Action**을 통해 서버에서 수행 (service_role key는 서버에서만 사용)
* 매핑 실패 행(ref 값이 어떤 캠페인에도 매핑되지 않는 경우)은 무시하지 않고 **별도 표시**하여 관리자에게 알림
* 부분 실패 시 전체 **트랜잭션 롤백** 처리 (upload_batch_id로 추적)

### 4.3. 정산 계산 공식
* **인플루언서 수수료**: `influencer_commission = (total_sales_amount - refund_amount) × commission_rate / 100`
  * `commission_rate`는 캠페인 매칭 시 확정되어 `campaigns.commission_rate`에 스냅샷으로 저장
* **정산 주기**: 캠페인 완료 후 캠페인 단위로 정산 생성
* **정산 금액 산출**:
  * `인플루언서 지급액` = 캠페인 기간 내 daily_records의 influencer_commission 합산
  * `플랫폼 수수료` = 총 판매액의 일정 비율 (관리자 설정 가능, 기본 0%)
  * `브랜드 지급액` = 총 판매액 - 인플루언서 지급액 - 플랫폼 수수료 - 환불액

### 4.4. 상태 변화 흐름 (State Machine)

**Product:**
```
DRAFT(임시저장) → PENDING(등록 요청) → APPROVED(관리자 승인)
                                     → REJECTED(관리자 반려) → PENDING(수정 후 재심사)
```

**Campaign:**
```
REQUESTED(인플루언서 픽) → MATCHED(브랜드 수락) → ONGOING(관리자 링크 등록 및 기간 도래) → COMPLETED(기간 종료)
                        → REJECTED(브랜드 거절)
REQUESTED → CANCELLED(인플루언서 취소)
MATCHED → CANCELLED(브랜드 또는 인플루언서 취소, 사유 필수)
```

**Settlement:**
```
PENDING(정산 생성) → CONFIRMED(금액 확인 완료) → PAID(지급 완료)
```

### 4.5. 알림 발송 시점
| 이벤트 | 수신자 | 알림 유형 |
|--------|--------|-----------|
| 상품 승인 | BRAND | PRODUCT_APPROVED |
| 상품 반려 | BRAND | PRODUCT_REJECTED |
| 공구 요청 접수 | BRAND | CAMPAIGN_REQUESTED |
| 매칭 수락 | INFLUENCER | CAMPAIGN_MATCHED |
| 매칭 거절 | INFLUENCER | CAMPAIGN_REJECTED |
| 아임웹 링크 등록 완료 | INFLUENCER | LINK_READY |
| 새 실적 데이터 업로드 | INFLUENCER | RECORDS_UPLOADED |

---

## 5. 클로드 코드 작업 지시 (Action Items)

클로드 코드는 위 명세서를 바탕으로 다음 순서대로 작업을 진행해 주세요.

1. **프로젝트 초기화:** `npx create-next-app@latest` 실행 및 shadcn/ui 초기화, `zod`, `react-hook-form`, `recharts`, `xlsx` 설치
2. **Supabase 연동:** `@supabase/ssr` 및 `@supabase/supabase-js` 설치, 환경 변수(`.env.local`) 세팅
   * 필요 환경 변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`(서버 전용)
3. **DB 스키마 및 RLS 작성:** Supabase SQL 쿼리문을 작성하여 테이블(profiles, products, campaigns, daily_records, settlements, excel_uploads, notifications), RLS 정책, CHECK 제약, UNIQUE 제약, INDEX, Storage 버킷(`assets`) 생성 스크립트 준비
4. **인증 및 미들웨어 구현:** Supabase Auth 연동 및 **profiles 테이블 기반** Role 라우팅 보호(Middleware) 적용. 회원가입 시 BRAND/INFLUENCER만 선택 가능.
5. **API 및 UI 구현 (Role별):**
   * 브랜드용 상품 등록(Storage 업로드 포함, zod 검증) 및 대시보드, 반려 상품 재심사 요청
   * 인플루언서용 소싱 리스트(검색/필터/정렬/페이지네이션) 및 링크 확인 페이지
   * 관리자용 승인 처리(반려 사유 입력), 엑셀 파싱(미리보기 → Server Action으로 insert), 정산 관리, 사용자 관리
   * 알림 시스템 (인앱 알림 센터)
6. **Vercel 배포 준비:** Vercel 배포 시 문제없도록 빌드 에러 체크 및 환경 변수 가이드 작성
