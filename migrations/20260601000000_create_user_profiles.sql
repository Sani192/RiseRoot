-- Persist onboarding profile details that do not belong directly on users.

create table if not exists public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  age integer not null,
  height_text text,
  weight_text text,
  goals jsonb not null default '[]'::jsonb,
  preferred_gym_timing text not null,
  wake_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_age_check check (age between 13 and 100),
  constraint user_profiles_goals_array_check check (jsonb_typeof(goals) = 'array'),
  constraint user_profiles_goal_count_check check (jsonb_array_length(goals) between 1 and 8),
  constraint user_profiles_preferred_gym_timing_check check (preferred_gym_timing in ('Early morning', 'Lunch break', 'After work', 'Flexible')),
  constraint user_profiles_height_not_blank_check check (height_text is null or length(btrim(height_text)) > 0),
  constraint user_profiles_weight_not_blank_check check (weight_text is null or length(btrim(weight_text)) > 0)
);

create index if not exists user_profiles_updated_at_idx
  on public.user_profiles (updated_at);

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

