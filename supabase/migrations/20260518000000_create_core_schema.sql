-- RiseRoot core schema
-- Creates the initial Supabase/PostgreSQL tables documented in docs/database-schema.md.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  email text,
  timezone text not null default 'UTC',
  unit_system text not null default 'imperial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_unit_system_check check (unit_system in ('imperial', 'metric')),
  constraint users_email_not_blank_check check (email is null or length(btrim(email)) > 0)
);

create unique index if not exists users_email_unique_idx
  on public.users (lower(email))
  where email is not null;

create index if not exists users_created_at_idx
  on public.users (created_at);

create table if not exists public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  plan_date date not null,
  status text not null default 'draft',
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_plans_user_id_id_unique unique (user_id, id),
  constraint daily_plans_user_id_plan_date_unique unique (user_id, plan_date),
  constraint daily_plans_status_check check (status in ('draft', 'active', 'completed', 'archived'))
);

create index if not exists daily_plans_user_status_plan_date_idx
  on public.daily_plans (user_id, status, plan_date);

create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  daily_plan_id uuid not null,
  title text not null,
  description text,
  status text not null default 'todo',
  priority integer,
  sort_order integer not null default 0,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_tasks_user_id_id_unique unique (user_id, id),
  constraint daily_tasks_plan_owner_fk foreign key (user_id, daily_plan_id)
    references public.daily_plans(user_id, id) on delete cascade,
  constraint daily_tasks_status_check check (status in ('todo', 'in_progress', 'completed', 'skipped')),
  constraint daily_tasks_title_not_blank_check check (length(btrim(title)) > 0),
  constraint daily_tasks_completed_at_status_check check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed')
  )
);

create index if not exists daily_tasks_user_plan_sort_order_idx
  on public.daily_tasks (user_id, daily_plan_id, sort_order);

create index if not exists daily_tasks_user_status_due_at_idx
  on public.daily_tasks (user_id, status, due_at);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  daily_plan_id uuid,
  name text not null,
  workout_type text not null default 'mixed',
  status text not null default 'planned',
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workouts_user_id_id_unique unique (user_id, id),
  constraint workouts_plan_owner_fk foreign key (user_id, daily_plan_id)
    references public.daily_plans(user_id, id) on delete set null (daily_plan_id),
  constraint workouts_name_not_blank_check check (length(btrim(name)) > 0),
  constraint workouts_type_check check (workout_type in ('strength', 'cardio', 'mobility', 'recovery', 'mixed')),
  constraint workouts_status_check check (status in ('planned', 'in_progress', 'completed', 'skipped')),
  constraint workouts_completed_at_status_check check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed')
  )
);

create index if not exists workouts_user_plan_idx
  on public.workouts (user_id, daily_plan_id);

create index if not exists workouts_user_status_scheduled_at_idx
  on public.workouts (user_id, status, scheduled_at);

create index if not exists workouts_user_completed_at_idx
  on public.workouts (user_id, completed_at);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  workout_id uuid not null,
  name text not null,
  category text not null default 'strength',
  target_sets integer,
  target_reps integer,
  target_duration_seconds integer,
  target_weight numeric(8,2),
  actual_sets integer,
  actual_reps integer,
  actual_duration_seconds integer,
  actual_weight numeric(8,2),
  sort_order integer not null default 0,
  status text not null default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercises_user_id_id_unique unique (user_id, id),
  constraint exercises_workout_owner_fk foreign key (user_id, workout_id)
    references public.workouts(user_id, id) on delete cascade,
  constraint exercises_name_not_blank_check check (length(btrim(name)) > 0),
  constraint exercises_category_check check (category in ('strength', 'cardio', 'mobility', 'warmup', 'cooldown')),
  constraint exercises_status_check check (status in ('planned', 'completed', 'skipped', 'swapped')),
  constraint exercises_nonnegative_targets_check check (
    (target_sets is null or target_sets >= 0)
    and (target_reps is null or target_reps >= 0)
    and (target_duration_seconds is null or target_duration_seconds >= 0)
    and (target_weight is null or target_weight >= 0)
    and (actual_sets is null or actual_sets >= 0)
    and (actual_reps is null or actual_reps >= 0)
    and (actual_duration_seconds is null or actual_duration_seconds >= 0)
    and (actual_weight is null or actual_weight >= 0)
  )
);

create index if not exists exercises_user_workout_sort_order_idx
  on public.exercises (user_id, workout_id, sort_order);

create index if not exists exercises_user_name_idx
  on public.exercises (user_id, name);

create table if not exists public.exercise_alternatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  exercise_id uuid not null,
  alternative_name text not null,
  reason text,
  equipment_needed text,
  difficulty text,
  is_selected boolean not null default false,
  selected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercise_alternatives_exercise_owner_fk foreign key (user_id, exercise_id)
    references public.exercises(user_id, id) on delete cascade,
  constraint exercise_alternatives_name_not_blank_check check (length(btrim(alternative_name)) > 0),
  constraint exercise_alternatives_difficulty_check check (difficulty is null or difficulty in ('easier', 'similar', 'harder')),
  constraint exercise_alternatives_selected_at_check check (
    (is_selected and selected_at is not null)
    or (not is_selected and selected_at is null)
  )
);

create index if not exists exercise_alternatives_user_exercise_idx
  on public.exercise_alternatives (user_id, exercise_id);

create unique index if not exists exercise_alternatives_one_selected_per_exercise_idx
  on public.exercise_alternatives (exercise_id)
  where is_selected = true;

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  logged_on date not null,
  logged_at timestamptz,
  weight_value numeric(6,2) not null,
  weight_unit text not null,
  source text not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weight_logs_weight_positive_check check (weight_value > 0),
  constraint weight_logs_unit_check check (weight_unit in ('lb', 'kg')),
  constraint weight_logs_source_check check (source in ('manual', 'imported', 'device')),
  constraint weight_logs_user_logged_on_source_unique unique (user_id, logged_on, source)
);

create index if not exists weight_logs_user_logged_on_desc_idx
  on public.weight_logs (user_id, logged_on desc);

create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  daily_plan_id uuid,
  logged_on date not null,
  logged_at timestamptz not null default now(),
  mood_score integer not null,
  energy_score integer,
  stress_score integer,
  tags jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mood_logs_plan_owner_fk foreign key (user_id, daily_plan_id)
    references public.daily_plans(user_id, id) on delete set null (daily_plan_id),
  constraint mood_logs_mood_score_check check (mood_score between 1 and 10),
  constraint mood_logs_energy_score_check check (energy_score is null or energy_score between 1 and 10),
  constraint mood_logs_stress_score_check check (stress_score is null or stress_score between 1 and 10),
  constraint mood_logs_tags_array_check check (jsonb_typeof(tags) = 'array')
);

create index if not exists mood_logs_user_logged_on_desc_idx
  on public.mood_logs (user_id, logged_on desc);

create index if not exists mood_logs_user_plan_idx
  on public.mood_logs (user_id, daily_plan_id);

create index if not exists mood_logs_tags_gin_idx
  on public.mood_logs using gin (tags);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  daily_plan_id uuid,
  note_date date not null,
  title text,
  body text not null,
  category text not null default 'daily',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_plan_owner_fk foreign key (user_id, daily_plan_id)
    references public.daily_plans(user_id, id) on delete set null (daily_plan_id),
  constraint notes_body_not_blank_check check (length(btrim(body)) > 0),
  constraint notes_category_check check (category in ('daily', 'workout', 'meal', 'wellbeing', 'general'))
);

create index if not exists notes_user_note_date_desc_idx
  on public.notes (user_id, note_date desc);

create index if not exists notes_user_plan_pinned_idx
  on public.notes (user_id, daily_plan_id, pinned);

create table if not exists public.meal_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  daily_plan_id uuid,
  meal_date date not null,
  meal_type text not null,
  title text not null,
  description text,
  ingredients jsonb not null default '[]'::jsonb,
  nutrition_summary jsonb not null default '{}'::jsonb,
  status text not null default 'suggested',
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meal_suggestions_user_id_id_unique unique (user_id, id),
  constraint meal_suggestions_plan_owner_fk foreign key (user_id, daily_plan_id)
    references public.daily_plans(user_id, id) on delete set null (daily_plan_id),
  constraint meal_suggestions_type_check check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  constraint meal_suggestions_title_not_blank_check check (length(btrim(title)) > 0),
  constraint meal_suggestions_status_check check (status in ('suggested', 'accepted', 'skipped', 'replaced', 'completed')),
  constraint meal_suggestions_source_check check (source in ('manual', 'template', 'generated')),
  constraint meal_suggestions_ingredients_array_check check (jsonb_typeof(ingredients) = 'array'),
  constraint meal_suggestions_nutrition_object_check check (jsonb_typeof(nutrition_summary) = 'object')
);

create index if not exists meal_suggestions_user_date_type_idx
  on public.meal_suggestions (user_id, meal_date, meal_type);

create index if not exists meal_suggestions_user_status_date_idx
  on public.meal_suggestions (user_id, status, meal_date);

create index if not exists meal_suggestions_ingredients_gin_idx
  on public.meal_suggestions using gin (ingredients);

create index if not exists meal_suggestions_nutrition_summary_gin_idx
  on public.meal_suggestions using gin (nutrition_summary);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  daily_plan_id uuid,
  related_type text,
  related_id uuid,
  category text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled',
  channel text not null default 'in_app',
  snoozed_until timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_plan_owner_fk foreign key (user_id, daily_plan_id)
    references public.daily_plans(user_id, id) on delete set null (daily_plan_id),
  constraint reminders_related_pair_check check (
    (related_type is null and related_id is null)
    or (related_type is not null and related_id is not null)
  ),
  constraint reminders_related_type_check check (related_type is null or related_type in ('daily_plan', 'daily_task', 'workout', 'meal_suggestion', 'mood_log', 'note')),
  constraint reminders_category_check check (category in ('task', 'workout', 'meal', 'hydration', 'wellbeing', 'daily_review')),
  constraint reminders_status_check check (status in ('scheduled', 'sent', 'dismissed', 'snoozed', 'cancelled')),
  constraint reminders_channel_check check (channel in ('in_app', 'push', 'email')),
  constraint reminders_snoozed_until_status_check check (status <> 'snoozed' or snoozed_until is not null),
  constraint reminders_delivered_at_status_check check (status <> 'sent' or delivered_at is not null)
);

create index if not exists reminders_user_scheduled_at_idx
  on public.reminders (user_id, scheduled_at);

create index if not exists reminders_status_scheduled_at_idx
  on public.reminders (status, scheduled_at);

create index if not exists reminders_user_related_idx
  on public.reminders (user_id, related_type, related_id);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_daily_plans_updated_at on public.daily_plans;
create trigger set_daily_plans_updated_at
before update on public.daily_plans
for each row execute function public.set_updated_at();

drop trigger if exists set_daily_tasks_updated_at on public.daily_tasks;
create trigger set_daily_tasks_updated_at
before update on public.daily_tasks
for each row execute function public.set_updated_at();

drop trigger if exists set_workouts_updated_at on public.workouts;
create trigger set_workouts_updated_at
before update on public.workouts
for each row execute function public.set_updated_at();

drop trigger if exists set_exercises_updated_at on public.exercises;
create trigger set_exercises_updated_at
before update on public.exercises
for each row execute function public.set_updated_at();

drop trigger if exists set_exercise_alternatives_updated_at on public.exercise_alternatives;
create trigger set_exercise_alternatives_updated_at
before update on public.exercise_alternatives
for each row execute function public.set_updated_at();

drop trigger if exists set_weight_logs_updated_at on public.weight_logs;
create trigger set_weight_logs_updated_at
before update on public.weight_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_mood_logs_updated_at on public.mood_logs;
create trigger set_mood_logs_updated_at
before update on public.mood_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_notes_updated_at on public.notes;
create trigger set_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

drop trigger if exists set_meal_suggestions_updated_at on public.meal_suggestions;
create trigger set_meal_suggestions_updated_at
before update on public.meal_suggestions
for each row execute function public.set_updated_at();

drop trigger if exists set_reminders_updated_at on public.reminders;
create trigger set_reminders_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();
