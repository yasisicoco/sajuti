-- ============================================
-- 1. compatibility_results (예전 결과 공유 링크용, /result/[id])
-- ============================================
create table if not exists public.compatibility_results (
  id uuid primary key default gen_random_uuid(),
  person_a jsonb not null,
  person_b jsonb not null,
  mbti_score smallint not null check (mbti_score >= 0 and mbti_score <= 100),
  saju_score smallint not null check (saju_score >= 0 and saju_score <= 100),
  created_at timestamptz not null default now()
);
alter table public.compatibility_results enable row level security;
create policy "Anyone can read compatibility_results"
  on public.compatibility_results for select using (true);
create policy "Allow insert compatibility_results"
  on public.compatibility_results for insert with check (true);

-- ============================================
-- 2. 방(room) + 참여자(room_participants)
-- ============================================
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  is_creator boolean not null default false,
  name text,
  mbti char(4) not null,
  birth_year smallint not null,
  birth_month smallint not null,
  birth_day smallint not null,
  birth_hour smallint not null,
  created_at timestamptz not null default now(),
  unique(room_id, id)
);

create index if not exists idx_room_participants_room_id on public.room_participants(room_id);

comment on table public.rooms is '궁합 모임 방';
comment on table public.room_participants is '방 참여자 (방장=첫 참여자, is_creator=true)';

alter table public.rooms enable row level security;
alter table public.room_participants enable row level security;

create policy "Anyone can read rooms"
  on public.rooms for select using (true);
create policy "Anyone can insert rooms"
  on public.rooms for insert with check (true);

create policy "Anyone can read room_participants"
  on public.room_participants for select using (true);
create policy "Anyone can insert room_participants"
  on public.room_participants for insert with check (true);

-- ============================================
-- 3. compatibility_cache (MBTI/사주 궁합 GPT 생성문 캐시)
-- ============================================
create table if not exists public.compatibility_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  type text not null check (type in ('mbti', 'saju')),
  content jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_compatibility_cache_key on public.compatibility_cache(cache_key);

comment on table public.compatibility_cache is 'MBTI 궁합 / 사주 궁합 GPT 생성 설명 캐시';

alter table public.compatibility_cache enable row level security;
create policy "Anyone can read compatibility_cache"
  on public.compatibility_cache for select using (true);
create policy "Anyone can insert compatibility_cache"
  on public.compatibility_cache for insert with check (true);
