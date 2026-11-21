-- Рейтинг друзей Prep&Play («Друзья» в профиле).
--
-- Как запустить: Supabase -> SQL Editor -> New query -> вставить весь этот файл -> Run.
-- Скрипт можно запускать повторно: он ничего не ломает и не удаляет данные.
--
-- Что хранится: одна строка на игрока, который открыл «Друзей» и вошёл в аккаунт:
-- код для друзей, имя из профиля, вид Препи, опыт за неделю, серия и уровень. Почты здесь нет.
-- Видеть строку могут только те, кто знает код (через функцию board_by_codes).
-- Список всех игроков получить нельзя: общего правила на чтение нет.

-- ---------- Таблица ----------

create table if not exists public.board (
  user_id uuid primary key references auth.users (id) on delete cascade,
  code text unique not null check (code ~ '^PREP-[2-9A-HJ-NP-Z]{5}$'),
  name text check (name is null or char_length(name) <= 24),
  look jsonb check (look is null or (jsonb_typeof(look) = 'object' and length(look::text) <= 400)),
  week text check (week is null or week ~ '^[0-9]{4}-W[0-9]{2}$'),
  week_xp int not null default 0 check (week_xp between 0 and 10000000),
  streak int not null default 0 check (streak between 0 and 100000),
  level int not null default 1 check (level between 1 and 100000),
  updated_at timestamptz not null default now()
);

-- Удаление аккаунта (функция delete_me удаляет пользователя из auth.users) убирает и его строку
-- рейтинга сама: это делает "on delete cascade" у user_id. Отдельно ничего вызывать не нужно.

alter table public.board enable row level security;

-- Время обновления ставит база, а не браузер.
create or replace function public.board_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists board_touch on public.board;
create trigger board_touch before insert or update on public.board
  for each row execute function public.board_touch();

-- ---------- Права ----------

-- Гостям (anon) таблица недоступна совсем; вошедшим - только своя строка.
revoke all on public.board from anon, public;
grant select, insert, update, delete on public.board to authenticated;

-- Своя строка: прочитать (нужно для upsert и чтобы узнать свой код на новом устройстве),
-- создать, изменить и удалить («Убрать меня из рейтинга»). Чужие строки так не читаются.
drop policy if exists "board own select" on public.board;
create policy "board own select" on public.board
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "board own insert" on public.board;
create policy "board own insert" on public.board
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "board own update" on public.board;
create policy "board own update" on public.board
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "board own delete" on public.board;
create policy "board own delete" on public.board
  for delete to authenticated using (auth.uid() = user_id);

-- ---------- Строки друзей по кодам ----------

-- Возвращает только открытые поля (без user_id и почты) и не больше 50 кодов за раз.
-- week - неделя, к которой относится week_xp: если она не текущая, сайт сам показывает 0.
-- Серия, которую не обновляли больше 48 часов, уже прервалась - отдаём 0.
create or replace function public.board_by_codes(codes text[])
returns table (code text, name text, look jsonb, week text, week_xp int, streak int, level int)
language sql
stable
security definer
set search_path = public
as $$
  select b.code, b.name, b.look, b.week, b.week_xp,
         case when b.updated_at > now() - interval '48 hours' then b.streak else 0 end,
         b.level
  from public.board b
  where auth.uid() is not null
    and b.code = any ((codes)[1:50]);
$$;

revoke all on function public.board_by_codes(text[]) from public, anon;
grant execute on function public.board_by_codes(text[]) to authenticated;
