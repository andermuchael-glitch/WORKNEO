-- WORKNEO · Otimização de transferência de dados (Egress)
-- Execute este arquivo no Supabase SQL Editor antes de publicar a nova versão.
-- Não apaga nem altera listas, relatórios ou histórico.

create or replace function public.get_workneo_workspace_version(p_workspace_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_updated timestamptz;
begin
  select w.owner_user_id into v_owner
  from public.workneo_workspaces w
  where w.id=p_workspace_id
    and exists (
      select 1 from public.workneo_workspace_members m
      where m.workspace_id=w.id and m.user_id=(select auth.uid()) and m.active
    );
  if v_owner is null then raise exception 'Sem acesso à equipe'; end if;

  select d.updated_at into v_updated
  from public.workneo_data d where d.user_id=v_owner;

  return jsonb_build_object('updated_at',v_updated);
end;
$$;

create or replace function public.get_workneo_share_version(p_token text)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_updated timestamptz;
begin
  select s.owner_user_id into v_owner
  from public.workneo_shares s
  where s.share_token=p_token and s.active=true
  limit 1;
  if v_owner is null then raise exception 'Link de acompanhamento inválido ou desativado'; end if;

  select d.updated_at into v_updated
  from public.workneo_data d where d.user_id=v_owner;

  return jsonb_build_object('updated_at',v_updated);
end;
$$;

revoke all on function public.get_workneo_workspace_version(uuid) from public;
revoke all on function public.get_workneo_share_version(text) from public;
grant execute on function public.get_workneo_workspace_version(uuid) to authenticated;
grant execute on function public.get_workneo_share_version(text) to anon,authenticated;
