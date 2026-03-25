-- ============================================
-- 소비도감 (Sobidogam) - DB Schema & RLS
-- Supabase SQL Editor에서 실행
-- ============================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLES
-- ============================================

-- 1.1 profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('BRAND', 'INFLUENCER', 'ADMIN')),
  company_name TEXT,
  contact_email TEXT,
  phone TEXT,
  bank_name TEXT,
  bank_account TEXT,
  account_holder TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  margin_rate NUMERIC CHECK (margin_rate >= 0 AND margin_rate <= 100),
  category TEXT,
  desired_period_start DATE,
  desired_period_end DATE,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED')),
  rejection_reason TEXT,
  asset_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);

-- 1.3 campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'MATCHED', 'REJECTED', 'CANCELLED', 'ONGOING', 'COMPLETED')),
  rejection_reason TEXT,
  desired_start_date DATE,
  desired_end_date DATE,
  start_date DATE,
  end_date DATE,
  commission_rate NUMERIC,
  imweb_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_influencer_id ON public.campaigns(influencer_id);
CREATE INDEX idx_campaigns_product_id ON public.campaigns(product_id);

-- 1.4 excel_uploads
CREATE TABLE public.excel_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  file_name TEXT NOT NULL,
  file_url TEXT,
  total_rows INTEGER DEFAULT 0,
  matched_rows INTEGER DEFAULT 0,
  unmatched_rows INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.5 daily_records
CREATE TABLE public.daily_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  upload_batch_id UUID REFERENCES public.excel_uploads(id),
  uploaded_by UUID REFERENCES public.profiles(id),
  record_date DATE NOT NULL,
  order_count INTEGER NOT NULL DEFAULT 0,
  cancel_count INTEGER NOT NULL DEFAULT 0,
  total_sales_amount NUMERIC NOT NULL DEFAULT 0,
  refund_amount NUMERIC NOT NULL DEFAULT 0,
  influencer_commission NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, record_date)
);

-- 1.6 settlements
CREATE TABLE public.settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  total_refunds NUMERIC NOT NULL DEFAULT 0,
  influencer_payout NUMERIC NOT NULL DEFAULT 0,
  brand_payout NUMERIC NOT NULL DEFAULT 0,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PAID')),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.7 notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);

-- ============================================
-- 2. FUNCTIONS
-- ============================================

-- 2.1 Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, contact_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'INFLUENCER'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2.2 Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 3. HELPER FUNCTION (role check)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4.1 profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'ADMIN');
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'ADMIN');
-- Allow brand/influencer to see each other's basic info (for matching)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- 4.2 products
CREATE POLICY "products_select_brand_own" ON public.products
  FOR SELECT USING (brand_id = auth.uid());
CREATE POLICY "products_select_influencer_approved" ON public.products
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'INFLUENCER' AND status = 'APPROVED'
  );
CREATE POLICY "products_select_admin" ON public.products
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'ADMIN');
CREATE POLICY "products_insert_brand" ON public.products
  FOR INSERT WITH CHECK (
    brand_id = auth.uid() AND public.get_user_role(auth.uid()) = 'BRAND'
  );
CREATE POLICY "products_update_brand_own" ON public.products
  FOR UPDATE USING (
    brand_id = auth.uid() AND public.get_user_role(auth.uid()) = 'BRAND'
  );
CREATE POLICY "products_all_admin" ON public.products
  FOR ALL USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- 4.3 campaigns
CREATE POLICY "campaigns_select_influencer_own" ON public.campaigns
  FOR SELECT USING (influencer_id = auth.uid());
CREATE POLICY "campaigns_select_brand_own" ON public.campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.brand_id = auth.uid()
    )
  );
CREATE POLICY "campaigns_select_admin" ON public.campaigns
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'ADMIN');
CREATE POLICY "campaigns_insert_influencer" ON public.campaigns
  FOR INSERT WITH CHECK (
    influencer_id = auth.uid() AND public.get_user_role(auth.uid()) = 'INFLUENCER'
  );
CREATE POLICY "campaigns_update_influencer_own" ON public.campaigns
  FOR UPDATE USING (influencer_id = auth.uid());
CREATE POLICY "campaigns_update_brand_own" ON public.campaigns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.brand_id = auth.uid()
    )
  );
CREATE POLICY "campaigns_all_admin" ON public.campaigns
  FOR ALL USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- 4.4 daily_records
CREATE POLICY "daily_records_select_influencer" ON public.daily_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND c.influencer_id = auth.uid()
    )
  );
CREATE POLICY "daily_records_select_brand" ON public.daily_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.products p ON p.id = c.product_id
      WHERE c.id = campaign_id AND p.brand_id = auth.uid()
    )
  );
CREATE POLICY "daily_records_all_admin" ON public.daily_records
  FOR ALL USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- 4.5 settlements
CREATE POLICY "settlements_select_influencer" ON public.settlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND c.influencer_id = auth.uid()
    )
  );
CREATE POLICY "settlements_select_brand" ON public.settlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.products p ON p.id = c.product_id
      WHERE c.id = campaign_id AND p.brand_id = auth.uid()
    )
  );
CREATE POLICY "settlements_all_admin" ON public.settlements
  FOR ALL USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- 4.6 excel_uploads
CREATE POLICY "excel_uploads_all_admin" ON public.excel_uploads
  FOR ALL USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- 4.7 notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_all_admin" ON public.notifications
  FOR ALL USING (public.get_user_role(auth.uid()) = 'ADMIN');
CREATE POLICY "notifications_insert_system" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 5. STORAGE
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "assets_upload_brand" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND public.get_user_role(auth.uid()) = 'BRAND'
  );

CREATE POLICY "assets_select_brand_admin" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assets' AND (
      public.get_user_role(auth.uid()) = 'ADMIN'
      OR auth.uid()::text = (storage.foldername(name))[1]
    )
  );
