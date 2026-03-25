import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationType } from '@/types';

export async function createNotification(
  supabase: SupabaseClient,
  params: {
    userId: string;
    type: NotificationType;
    title: string;
    message?: string;
    referenceId?: string;
  }
) {
  return supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message || null,
    reference_id: params.referenceId || null,
  });
}
