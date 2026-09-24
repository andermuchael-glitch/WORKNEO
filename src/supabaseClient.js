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
export const AUTH_REDIRECT_URL = import.meta.env.VITE_AUTH_REDIRECT_URL || 'https://andermuchael-glitch.github.io/WORKNEO/';

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


export async function ensureWorkspace(){
  if(!supabase) throw new Error('Supabase não configurado.');
  const {data,error}=await supabase.rpc('ensure_workneo_workspace');
  if(error) throw error;
  return data;
}

export async function loadWorkspaceData(workspaceId){
  if(!supabase) throw new Error('Supabase não configurado.');
  const {data,error}=await supabase.rpc('get_workneo_workspace_data',{p_workspace_id:workspaceId});
  if(error) throw error;
  return data;
}

export async function saveWorkspaceData(workspaceId,lists,reports){
  if(!supabase) throw new Error('Supabase não configurado.');
  const {data,error}=await supabase.rpc('save_workneo_workspace_data',{
    p_workspace_id:workspaceId,p_lists:lists,p_reports:reports
  });
  if(error) throw error;
  return data;
}

export async function listWorkspaceMembers(workspaceId){
  if(!supabase) return [];
  const {data,error}=await supabase.rpc('list_workneo_members',{p_workspace_id:workspaceId});
  if(error) throw error;
  return Array.isArray(data)?data:[];
}

export async function addWorkspaceMember(workspaceId,email,displayName=''){
  if(!supabase) throw new Error('Supabase não configurado.');
  const {data,error}=await supabase.rpc('add_workneo_member',{
    p_workspace_id:workspaceId,p_email:email,p_display_name:displayName||null
  });
  if(error) throw error;
  return data;
}

export async function setWorkspaceMemberRole(workspaceId,userId,role){
  if(!supabase) throw new Error('Supabase não configurado.');
  const {data,error}=await supabase.rpc('set_workneo_member_role',{
    p_workspace_id:workspaceId,p_user_id:userId,p_role:role
  });
  if(error) throw error;
  return data;
}

export async function removeWorkspaceMember(workspaceId,userId){
  if(!supabase) throw new Error('Supabase não configurado.');
  const {data,error}=await supabase.rpc('remove_workneo_member',{
    p_workspace_id:workspaceId,p_user_id:userId
  });
  if(error) throw error;
  return data;
}

export function subscribeToWorkspaceData(workspaceId,onData,onStatus){
  if(!supabase||!workspaceId) return ()=>{};
  let alive=true;
  const poll=async()=>{
    try{
      const {data,error}=await supabase.rpc('get_workneo_workspace_data',{p_workspace_id:workspaceId});
      if(!alive)return;
      if(error)throw error;
      onData(data);
      onStatus?.('SUBSCRIBED');
    }catch(error){
      if(alive)onStatus?.('CHANNEL_ERROR',error);
    }
  };
  poll();
  const timer=setInterval(poll,5000);
  return ()=>{alive=false;clearInterval(timer)};
}
