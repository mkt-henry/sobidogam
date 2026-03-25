'use server';

import { createServiceClient } from '@/lib/supabase/server';

interface RecordRow {
  campaign_id: string;
  record_date: string;
  order_count: number;
  cancel_count: number;
  total_sales_amount: number;
  refund_amount: number;
  influencer_commission: number;
}

export async function uploadRecords(
  uploadedBy: string,
  fileName: string,
  records: RecordRow[],
  overwrite: boolean
) {
  const supabase = await createServiceClient();

  // Create upload batch
  const { data: upload, error: uploadError } = await supabase
    .from('excel_uploads')
    .insert({
      uploaded_by: uploadedBy,
      file_name: fileName,
      total_rows: records.length,
      matched_rows: records.length,
      unmatched_rows: 0,
      status: 'PROCESSING',
    })
    .select()
    .single();

  if (uploadError || !upload) {
    return { success: false, error: '업로드 배치 생성 실패: ' + uploadError?.message };
  }

  try {
    if (overwrite) {
      // Delete existing records for same campaign_id + record_date combinations
      for (const record of records) {
        await supabase
          .from('daily_records')
          .delete()
          .eq('campaign_id', record.campaign_id)
          .eq('record_date', record.record_date);
      }
    }

    const insertData = records.map((r) => ({
      ...r,
      upload_batch_id: upload.id,
      uploaded_by: uploadedBy,
    }));

    const { error: insertError } = await supabase
      .from('daily_records')
      .insert(insertData);

    if (insertError) {
      await supabase
        .from('excel_uploads')
        .update({ status: 'FAILED', error_message: insertError.message })
        .eq('id', upload.id);
      return { success: false, error: insertError.message };
    }

    await supabase
      .from('excel_uploads')
      .update({ status: 'COMPLETED' })
      .eq('id', upload.id);

    // Send notifications to influencers
    const campaignIds = [...new Set(records.map((r) => r.campaign_id))];
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, influencer_id, product_id, products(name)')
      .in('id', campaignIds);

    if (campaigns) {
      const notifications = campaigns.map((c: any) => ({
        user_id: c.influencer_id,
        type: 'RECORDS_UPLOADED',
        title: '새 실적 데이터가 업로드되었습니다',
        message: `${c.products?.name || '상품'}의 실적이 업데이트되었습니다.`,
        reference_id: c.id,
      }));
      await supabase.from('notifications').insert(notifications);
    }

    return { success: true, uploadId: upload.id };
  } catch (err: any) {
    await supabase
      .from('excel_uploads')
      .update({ status: 'FAILED', error_message: err.message })
      .eq('id', upload.id);
    return { success: false, error: err.message };
  }
}
