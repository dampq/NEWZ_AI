-- Run once in Supabase > SQL Editor. Safe to run again.
create table if not exists public.reader_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 bookmarks jsonb not null default '[]'::jsonb,
 constraint bookmarks_is_array check (jsonb_typeof(bookmarks) = 'array' and octet_length(bookmarks::text) <= 250000)
);
alter table public.reader_preferences enable row level security;
drop policy if exists "Readers own their preferences" on public.reader_preferences;
create policy "Readers own their preferences" on public.reader_preferences
 for all to authenticated using ((select auth.uid()) = user_id)
 with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.reader_preferences to authenticated;
revoke all on public.reader_preferences from anon;
