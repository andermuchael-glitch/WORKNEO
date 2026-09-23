create extension if not exists pgcrypto;

create table if not exists public.workneo_shares (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  share_token text not null unique,
  share_type text not null default 'general' check (share_type in ('general','list','seamstress')),
  list_id text,
  costureira text,
  start_date date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.workneo_shares enable row level security;

drop policy if exists "WORKNEO share owner select" on public.workneo_shares;
create policy "WORKNEO share owner select" on public.workneo_shares
for select to authenticated using (auth.uid()=owner_user_id);

drop policy if exists "WORKNEO share owner modify" on public.workneo_shares;
create policy "WORKNEO share owner modify" on public.workneo_shares
for all to authenticated using (auth.uid()=owner_user_id) with check (auth.uid()=owner_user_id);

grant select, insert, update, delete on public.workneo_shares to authenticated;

create or replace function public.create_workneo_share(
  p_share_type text default 'general',
  p_list_id text default null,
  p_costureira text default null,
  p_start_date date default null,
  p_end_date date default null
) returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_id uuid;
  v_token text;
begin
  if auth.uid() is null then raise exception 'Não autenticado'; end if;
  if p_share_type not in ('general','list','seamstress') then raise exception 'Tipo de compartilhamento inválido'; end if;
  if p_share_type='list' and p_list_id is null then raise exception 'Informe a lista'; end if;
  if p_share_type='seamstress' and p_costureira is null then raise exception 'Informe a costureira'; end if;
  v_token=encode(gen_random_bytes(24),'hex');
  insert into public.workneo_shares(owner_user_id,share_token,share_type,list_id,costureira,start_date,end_date)
  values(auth.uid(),v_token,p_share_type,p_list_id,p_costureira,p_start_date,p_end_date)
  returning id into v_id;
  return jsonb_build_object('id',v_id,'token',v_token,'share_type',p_share_type,'list_id',p_list_id,'costureira',p_costureira,'start_date',p_start_date,'end_date',p_end_date,'active',true);
end;
$$;

create or replace function public.list_workneo_shares()
returns jsonb
language sql
security definer
set search_path=''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',s.id,'token',s.share_token,'share_type',s.share_type,'list_id',s.list_id,
    'costureira',s.costureira,'start_date',s.start_date,'end_date',s.end_date,
    'active',s.active,'created_at',s.created_at
  ) order by s.created_at desc),'[]'::jsonb)
  from public.workneo_shares s
  where s.owner_user_id=auth.uid();
$$;

create or replace function public.revoke_workneo_share(p_share_id uuid)
returns boolean
language sql
security definer
set search_path=''
as $$
  update public.workneo_shares set active=false
  where id=p_share_id and owner_user_id=auth.uid()
  returning true;
$$;

create or replace function public.get_workneo_share(p_token text)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  s public.workneo_shares;
  d public.workneo_data;
  v_reports jsonb;
  v_lists jsonb;
begin
  select * into s from public.workneo_shares
  where share_token=p_token and active=true
    and (start_date is null or start_date <= coalesce(end_date,start_date))
  limit 1;
  if not found then raise exception 'Link de acompanhamento inválido ou desativado'; end if;

  select * into d from public.workneo_data where user_id=s.owner_user_id;
  if not found then
    return jsonb_build_object('share',jsonb_build_object('share_type',s.share_type,'list_id',s.list_id,'costureira',s.costureira,'start_date',s.start_date,'end_date',s.end_date),'reports','[]'::jsonb,'lists','[]'::jsonb);
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',r->>'id','listId',r->>'listId','listName',r->>'listName',
    'date',r->>'date','costureira',r->>'costureira',
    'items',(select coalesce(jsonb_agg(jsonb_build_object(
      'product',i->>'product','qty',i->>'qty','color',i->>'color','pedido',i->>'pedido'
    )),'[]'::jsonb) from jsonb_array_elements(coalesce(r->'items','[]'::jsonb)) i)
  )),'[]'::jsonb)
  into v_reports
  from jsonb_array_elements(coalesce(d.reports,'[]'::jsonb)) r
  where (s.share_type<>'list' or r->>'listId'=s.list_id)
    and (s.share_type<>'seamstress' or r->>'costureira'=s.costureira)
    and (s.start_date is null or (r->>'date')::date >= s.start_date)
    and (s.end_date is null or (r->>'date')::date <= s.end_date);

  select coalesce(jsonb_agg(jsonb_build_object('id',l->>'id','name',l->>'name')),'[]'::jsonb)
  into v_lists
  from jsonb_array_elements(coalesce(d.lists,'[]'::jsonb)) l
  where exists (select 1 from jsonb_array_elements(v_reports) rr where rr->>'listId'=l->>'id');

  return jsonb_build_object(
    'share',jsonb_build_object('share_type',s.share_type,'list_id',s.list_id,'costureira',s.costureira,'start_date',s.start_date,'end_date',s.end_date),
    'reports',v_reports,'lists',v_lists,'server_time',now()
  );
end;
$$;

revoke all on function public.get_workneo_share(text) from public;
grant execute on function public.get_workneo_share(text) to anon,authenticated;
grant execute on function public.create_workneo_share(text,text,text,date,date) to authenticated;
grant execute on function public.list_workneo_shares() to authenticated;
grant execute on function public.revoke_workneo_share(uuid) to authenticated;
