import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const CLOUD_TABLE = 'workneo_data';

export async function loadCloudData(userId) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase
    .from(CLOUD_TABLE)
    .select('user_id,lists,reports,updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveCloudData(userId, lists, reports) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const updatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from(CLOUD_TABLE)
    .upsert(
      {
        user_id: userId,
        lists,
        reports,
        updated_at: updatedAt,
      },
      { onConflict: 'user_id' }
    )
    .select('user_id,lists,reports,updated_at')
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToCloud(userId, onData, onStatus) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('workneo-sync-' + userId)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: CLOUD_TABLE,
        filter: 'user_id=eq.' + userId,
      },
      payload => {
        if (payload.eventType === 'DELETE') {
          onData(null);
          return;
        }
        onData(payload.new);
      }
    )
    .subscribe(status => onStatus?.(status));

  return () => {
    supabase.removeChannel(channel);
  };
}
