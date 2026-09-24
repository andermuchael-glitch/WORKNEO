-- WORKNEO — equipes e dados compartilhados
-- Execute este arquivo no Supabase SQL Editor antes de ativar a nova interface.
-- A autorização é feita no banco com RLS e funções protegidas.

create extension if not exists pgcrypto;

create table if not exists public.workneo_workspaces (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null default 'WORKNEO',
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workneo_workspace_members (
  workspace_id uuid not null references public.workneo_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin','member')),
  display_name text,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);

create index if not exists workneo_workspace_members_user_idx
  on public.workneo_workspace_members(user_id);

alter table public.workneo_workspaces enable row level security;
alter table public.workneo_workspace_members enable row level security;

revoke all on public.workneo_workspaces from anon,authenticated;
revoke all on public.workneo_workspace_members from anon,authenticated;

grant select on public.workneo_workspaces to authenticated;
grant select on public.workneo_workspace_members to authenticated;

drop policy if exists "WORKNEO workspace member read" on public.workneo_workspaces;
create policy "WORKNEO workspace member read"
on public.workneo_workspaces for select to authenticated
using (
  exists (
    select 1 from public.workneo_workspace_members m
    where m.workspace_id=id and m.user_id=(select auth.uid()) and m.active
  )
);

drop policy if exists "WORKNEO member read team" on public.workneo_workspace_members;
create policy "WORKNEO member read team"
on public.workneo_workspace_members for select to authenticated
using (
  (select public.workneo_current_membership(workneo_workspace_members.workspace_id)) is not null
);

create or replace function public.workneo_current_membership(p_workspace_id uuid)
returns public.workneo_workspace_members
language sql
security definer
stable
set search_path=''
as $$
  select m.*
  from public.workneo_workspace_members m
  where m.workspace_id=p_workspace_id
    and m.user_id=(select auth.uid())
    and m.active=true
  limit 1;
$$;

revoke all on function public.workneo_current_membership(uuid) from public;
grant execute on function public.workneo_current_membership(uuid) to authenticated;

create or replace function public.ensure_workneo_workspace()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_user uuid := (select auth.uid());
  v_workspace public.workneo_workspaces;
  v_member public.workneo_workspace_members;
  v_data public.workneo_data;
begin
  if v_user is null then raise exception 'Não autenticado'; end if;

  select m.* into v_member
  from public.workneo_workspace_members m
  where m.user_id=v_user and m.active=true
  order by m.created_at
  limit 1;

  if found then
    select * into v_workspace from public.workneo_workspaces where id=v_member.workspace_id;
    return jsonb_build_object(
      'workspace_id',v_workspace.id,
      'workspace_name',v_workspace.name,
      'owner_user_id',v_workspace.owner_user_id,
      'role',v_member.role,
      'display_name',coalesce(v_member.display_name,(select email from auth.users where id=v_user))
    );
  end if;

  select * into v_data from public.workneo_data where user_id=v_user limit 1;

  insert into public.workneo_workspaces(name,owner_user_id)
  values('WORKNEO · Equipe',(v_user))
  returning * into v_workspace;

  insert into public.workneo_workspace_members(workspace_id,user_id,role,display_name,email)
  values(
    v_workspace.id,v_user,'admin',
    coalesce((select raw_user_meta_data->>'name' from auth.users where id=v_user),(select email from auth.users where id=v_user)),
    (select email from auth.users where id=v_user)
  );

  if not found then
    insert into public.workneo_data(user_id,lists,reports,updated_at)
    values(v_user,'[]'::jsonb,'[]'::jsonb,now())
    on conflict (user_id) do nothing;
  end if;

  return jsonb_build_object(
    'workspace_id',v_workspace.id,
    'workspace_name',v_workspace.name,
    'owner_user_id',v_workspace.owner_user_id,
    'role','admin',
    'display_name',coalesce((select raw_user_meta_data->>'name' from auth.users where id=v_user),(select email from auth.users where id=v_user))
  );
end;
$$;

revoke all on function public.ensure_workneo_workspace() from public;
grant execute on function public.ensure_workneo_workspace() to authenticated;

create or replace function public.get_workneo_workspace_data(p_workspace_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_data public.workneo_data;
begin
  select owner_user_id into v_owner
  from public.workneo_workspaces w
  where w.id=p_workspace_id
    and exists (
      select 1 from public.workneo_workspace_members m
      where m.workspace_id=w.id and m.user_id=(select auth.uid()) and m.active
    );

  if v_owner is null then raise exception 'Sem acesso à equipe'; end if;

  select * into v_data from public.workneo_data where user_id=v_owner limit 1;
  if not found then
    return jsonb_build_object('workspace_id',p_workspace_id,'user_id',v_owner,'lists','[]'::jsonb,'reports','[]'::jsonb,'updated_at',now());
  end if;

  return jsonb_build_object(
    'workspace_id',p_workspace_id,
    'user_id',v_data.user_id,
    'lists',coalesce(v_data.lists,'[]'::jsonb),
    'reports',coalesce(v_data.reports,'[]'::jsonb),
    'updated_at',v_data.updated_at
  );
end;
$$;

revoke all on function public.get_workneo_workspace_data(uuid) from public;
grant execute on function public.get_workneo_workspace_data(uuid) to authenticated;

create or replace function public.save_workneo_workspace_data(
  p_workspace_id uuid,
  p_lists jsonb,
  p_reports jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_user uuid := (select auth.uid());
  v_owner uuid;
  v_role text;
  v_old public.workneo_data;
  v_updated timestamptz := now();
begin
  if v_user is null then raise exception 'Não autenticado'; end if;
  if jsonb_typeof(p_lists)<>'array' or jsonb_typeof(p_reports)<>'array' then
    raise exception 'Dados inválidos';
  end if;

  select w.owner_user_id,m.role into v_owner,v_role
  from public.workneo_workspaces w
  join public.workneo_workspace_members m
    on m.workspace_id=w.id and m.user_id=v_user and m.active
  where w.id=p_workspace_id;

  if v_owner is null then raise exception 'Sem acesso à equipe'; end if;

  select * into v_old from public.workneo_data where user_id=v_owner limit 1;

  -- Colaborador pode criar e alterar, mas não remover listas, itens ou relatórios.
  -- Itens zerados são preservados pelo aplicativo para permitir concluir um lançamento.
  if v_role<>'admin' and found then
    if exists (
      select 1
      from jsonb_array_elements(coalesce(v_old.lists,'[]'::jsonb)) old_list
      where not exists (
        select 1 from jsonb_array_elements(p_lists) new_list
        where new_list->>'id'=old_list->>'id'
      )
    ) then raise exception 'Somente o administrador pode excluir listas.'; end if;

    if exists (
      select 1
      from jsonb_array_elements(coalesce(v_old.reports,'[]'::jsonb)) old_report
      where not exists (
        select 1 from jsonb_array_elements(p_reports) new_report
        where new_report->>'id'=old_report->>'id'
      )
    ) then raise exception 'Somente o administrador pode excluir relatórios.'; end if;

    if exists (
      select 1
      from jsonb_array_elements(coalesce(v_old.lists,'[]'::jsonb)) old_list,
           jsonb_array_elements(coalesce(old_list->'items','[]'::jsonb)) old_item
      where not exists (
        select 1
        from jsonb_array_elements(p_lists) new_list,
             jsonb_array_elements(coalesce(new_list->'items','[]'::jsonb)) new_item
        where new_list->>'id'=old_list->>'id'
          and new_item->>'id'=old_item->>'id'
      )
    ) then raise exception 'Somente o administrador pode excluir itens da lista.'; end if;
  end if;

  insert into public.workneo_data(user_id,lists,reports,updated_at)
  values(v_owner,p_lists,p_reports,v_updated)
  on conflict (user_id) do update
  set lists=excluded.lists,reports=excluded.reports,updated_at=excluded.updated_at;

  return jsonb_build_object('workspace_id',p_workspace_id,'user_id',v_owner,'lists',p_lists,'reports',p_reports,'updated_at',v_updated);
end;
$$;

revoke all on function public.save_workneo_workspace_data(uuid,jsonb,jsonb) from public;
grant execute on function public.save_workneo_workspace_data(uuid,jsonb,jsonb) to authenticated;

create or replace function public.list_workneo_members(p_workspace_id uuid)
returns jsonb
language sql
security definer
set search_path=''
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'user_id',m.user_id,
      'role',m.role,
      'display_name',coalesce(m.display_name,m.email),
      'email',m.email,
      'active',m.active,
      'created_at',m.created_at
    ) order by m.created_at
  ),'[]'::jsonb)
  from public.workneo_workspace_members m
  where m.workspace_id=p_workspace_id
    and exists (
      select 1 from public.workneo_workspace_members me
      where me.workspace_id=m.workspace_id and me.user_id=(select auth.uid()) and me.active
    );
$$;

revoke all on function public.list_workneo_members(uuid) from public;
grant execute on function public.list_workneo_members(uuid) to authenticated;

create or replace function public.add_workneo_member(
  p_workspace_id uuid,
  p_email text,
  p_display_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_admin boolean;
  v_user uuid;
  v_email text := lower(trim(p_email));
  v_name text := nullif(trim(coalesce(p_display_name,'')),'');
begin
  select exists(
    select 1 from public.workneo_workspace_members
    where workspace_id=p_workspace_id and user_id=(select auth.uid()) and role='admin' and active
  ) into v_admin;
  if not v_admin then raise exception 'Somente o administrador pode gerenciar a equipe.'; end if;

  select id into v_user from auth.users where lower(email)=v_email limit 1;
  if v_user is null then
    raise exception 'Usuário não encontrado. Primeiro crie a conta no WORKNEO com este e-mail.';
  end if;

  insert into public.workneo_workspace_members(workspace_id,user_id,role,display_name,email)
  values(p_workspace_id,v_user,'member',coalesce(v_name,(select raw_user_meta_data->>'name' from auth.users where id=v_user)),v_email)
  on conflict (workspace_id,user_id) do update
  set active=true,email=excluded.email,display_name=coalesce(excluded.display_name,public.workneo_workspace_members.display_name);

  return jsonb_build_object('user_id',v_user,'email',v_email,'role','member','display_name',coalesce(v_name,(select raw_user_meta_data->>'name' from auth.users where id=v_user),v_email));
end;
$$;

revoke all on function public.add_workneo_member(uuid,text,text) from public;
grant execute on function public.add_workneo_member(uuid,text,text) to authenticated;

create or replace function public.set_workneo_member_role(
  p_workspace_id uuid,
  p_user_id uuid,
  p_role text
)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare v_admin boolean; v_owner uuid;
begin
  select exists(
    select 1 from public.workneo_workspace_members
    where workspace_id=p_workspace_id and user_id=(select auth.uid()) and role='admin' and active
  ), owner_user_id into v_admin,v_owner
  from public.workneo_workspaces where id=p_workspace_id;

  if not v_admin then raise exception 'Somente o administrador pode alterar funções.'; end if;
  if p_role not in ('admin','member') then raise exception 'Função inválida.'; end if;
  if p_user_id=v_owner and p_role<>'admin' then raise exception 'O proprietário permanece administrador.'; end if;

  update public.workneo_workspace_members
  set role=p_role
  where workspace_id=p_workspace_id and user_id=p_user_id and active;
  return found;
end;
$$;

revoke all on function public.set_workneo_member_role(uuid,uuid,text) from public;
grant execute on function public.set_workneo_member_role(uuid,uuid,text) to authenticated;

create or replace function public.remove_workneo_member(
  p_workspace_id uuid,
  p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare v_admin boolean; v_owner uuid;
begin
  select exists(
    select 1 from public.workneo_workspace_members
    where workspace_id=p_workspace_id and user_id=(select auth.uid()) and role='admin' and active
  ), owner_user_id into v_admin,v_owner
  from public.workneo_workspaces where id=p_workspace_id;

  if not v_admin then raise exception 'Somente o administrador pode remover colaboradores.'; end if;
  if p_user_id=v_owner then raise exception 'O administrador proprietário não pode ser removido.'; end if;

  update public.workneo_workspace_members
  set active=false
  where workspace_id=p_workspace_id and user_id=p_user_id;
  return found;
end;
$$;

revoke all on function public.remove_workneo_member(uuid,uuid) from public;
grant execute on function public.remove_workneo_member(uuid,uuid) to authenticated;

-- A equipe acessa os dados compartilhados somente pelas funções autorizadas.
revoke select, insert, update, delete on public.workneo_data from authenticated;

-- Garantir que os dados antigos do proprietário continuem sendo lidos pelo acompanhamento público.
-- O acompanhamento existente usa owner_user_id e workneo_data, então não precisa de migração de formato.

