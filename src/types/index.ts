export type UserRole = 'BRAND' | 'INFLUENCER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type ProductStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type CampaignStatus = 'REQUESTED' | 'MATCHED' | 'REJECTED' | 'CANCELLED' | 'ONGOING' | 'COMPLETED';
export type SettlementStatus = 'PENDING' | 'CONFIRMED' | 'PAID';
export type ExcelUploadStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type NotificationType =
  | 'PRODUCT_APPROVED'
  | 'PRODUCT_REJECTED'
  | 'CAMPAIGN_REQUESTED'
  | 'CAMPAIGN_MATCHED'
  | 'CAMPAIGN_REJECTED'
  | 'LINK_READY'
  | 'RECORDS_UPLOADED';

export interface Profile {
  id: string;
  role: UserRole;
  company_name: string | null;
  contact_email: string | null;
  phone: string | null;
  bank_name: string | null;
  bank_account: string | null;
  account_holder: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  description: string | null;
  price: number;
  margin_rate: number | null;
  category: string | null;
  desired_period_start: string | null;
  desired_period_end: string | null;
  status: ProductStatus;
  rejection_reason: string | null;
  asset_url: string | null;
  created_at: string;
  updated_at: string;
  // joined
  brand?: Profile;
}

export interface Campaign {
  id: string;
  product_id: string;
  influencer_id: string;
  status: CampaignStatus;
  rejection_reason: string | null;
  desired_start_date: string | null;
  desired_end_date: string | null;
  start_date: string | null;
  end_date: string | null;
  commission_rate: number | null;
  imweb_link: string | null;
  created_at: string;
  updated_at: string;
  // joined
  product?: Product;
  influencer?: Profile;
}

export interface DailyRecord {
  id: string;
  campaign_id: string;
  upload_batch_id: string | null;
  uploaded_by: string | null;
  record_date: string;
  order_count: number;
  cancel_count: number;
  total_sales_amount: number;
  refund_amount: number;
  influencer_commission: number;
  created_at: string;
}

export interface Settlement {
  id: string;
  campaign_id: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  total_refunds: number;
  influencer_payout: number;
  brand_payout: number;
  platform_fee: number;
  status: SettlementStatus;
  settled_at: string | null;
  created_at: string;
  // joined
  campaign?: Campaign;
}

export interface ExcelUpload {
  id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string | null;
  total_rows: number;
  matched_rows: number;
  unmatched_rows: number;
  status: ExcelUploadStatus;
  error_message: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}
