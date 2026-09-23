-- WORKNEO · sincronização PC ↔ Android
-- Execute este arquivo no Supabase SQL Editor.

create table if not exists public.workneo_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lists jsonb not null default '[]'::jsonb,
  reports jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workneo_data enable row level security;

drop policy if exists "WORKNEO: ler os próprios dados" on public.workneo_data;
create policy "WORKNEO: ler os próprios dados"
on public.workneo_data
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "WORKNEO: criar os próprios dados" on public.workneo_data;
create policy "WORKNEO: criar os próprios dados"
on public.workneo_data
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "WORKNEO: atualizar os próprios dados" on public.workneo_data;
create policy "WORKNEO: atualizar os próprios dados"
on public.workneo_data
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "WORKNEO: excluir os próprios dados" on public.workneo_data;
create policy "WORKNEO: excluir os próprios dados"
on public.workneo_data
for delete
to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete on public.workneo_data to authenticated;

-- Necessário para sincronização em tempo real PC ↔ Android.
do $
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'workneo_data'
  ) then
    alter publication supabase_realtime add table public.workneo_data;
  end if;
end $;
