-- =============================================================================
-- Business English PWA — Schema inicial
-- Cobre: vocabulário (A1-C2), cenários, correção de email, speaking,
-- entrevista técnica, e tracking de progresso.
-- =============================================================================

-- Extensão necessária para gerar UUIDs
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUM: nível CEFR, usado em vocabulário, cenários e perguntas de entrevista
-- -----------------------------------------------------------------------------
create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- -----------------------------------------------------------------------------
-- VOCABULARY: banco de termos (curado, não gerado por IA em runtime)
-- -----------------------------------------------------------------------------
create table vocabulary_cards (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  translation_pt text not null,
  example_sentence text,
  level cefr_level not null,
  category text not null default 'general', -- ex: 'general', 'business', 'meetings', 'email'
  created_at timestamptz not null default now()
);

create index idx_vocabulary_cards_level on vocabulary_cards (level);
create index idx_vocabulary_cards_category on vocabulary_cards (category);

-- Progresso de spaced repetition por usuário e por card (algoritmo SM-2 simplificado)
create table user_vocabulary_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id uuid not null references vocabulary_cards (id) on delete cascade,
  ease_factor numeric not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  next_review_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, card_id)
);

create index idx_user_vocab_progress_next_review on user_vocabulary_progress (user_id, next_review_at);

-- -----------------------------------------------------------------------------
-- SCENARIOS: cenários de simulação de texto (reunião, negociação, follow-up...)
-- -----------------------------------------------------------------------------
create table scenarios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prompt text not null,
  category text not null default 'general', -- ex: 'meeting', 'negotiation', 'follow_up'
  level cefr_level not null default 'B1',
  created_at timestamptz not null default now()
);

create table scenario_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scenario_id uuid not null references scenarios (id) on delete cascade,
  user_response text not null,
  ai_feedback jsonb, -- { corrected_text, issues: [...], tone_notes, score }
  created_at timestamptz not null default now()
);

create index idx_scenario_attempts_user on scenario_attempts (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- EMAIL CORRECTION: histórico de correções de texto/email
-- -----------------------------------------------------------------------------
create table email_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  original_text text not null,
  ai_feedback jsonb, -- { corrected_text, issues: [...], style_notes }
  created_at timestamptz not null default now()
);

create index idx_email_corrections_user on email_corrections (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- SPEAKING PRACTICE: prompts falados + tentativas do usuário
-- -----------------------------------------------------------------------------
create table speaking_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt_text text not null,
  category text not null default 'general', -- ex: 'meeting', 'small_talk', 'presentation'
  level cefr_level not null default 'B1',
  created_at timestamptz not null default now()
);

create table speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt_id uuid not null references speaking_prompts (id) on delete cascade,
  transcript text not null,
  ai_feedback jsonb, -- { clarity_notes, grammar_issues: [...], vocabulary_suggestions }
  created_at timestamptz not null default now()
);

create index idx_speaking_attempts_user on speaking_attempts (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- TECHNICAL INTERVIEW: perguntas de entrevista técnica + tentativas
-- -----------------------------------------------------------------------------
create table interview_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  category text not null default 'general', -- ex: 'architecture', 'trade_offs', 'project_walkthrough'
  level cefr_level not null default 'B2',
  created_at timestamptz not null default now()
);

create table interview_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references interview_questions (id) on delete cascade,
  response_text text not null,
  response_mode text not null default 'text', -- 'text' ou 'voice'
  ai_feedback jsonb, -- { clarity_notes, structure_notes, grammar_issues: [...] }
  created_at timestamptz not null default now()
);

create index idx_interview_attempts_user on interview_attempts (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- PROGRESS TRACKING: streak e atividade diária agregada
-- -----------------------------------------------------------------------------
create table daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_date date not null default current_date,
  vocabulary_reviews integer not null default 0,
  scenarios_completed integer not null default 0,
  emails_corrected integer not null default 0,
  speaking_attempts integer not null default 0,
  interview_attempts integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, activity_date)
);

create index idx_daily_activity_user_date on daily_activity (user_id, activity_date desc);

-- =============================================================================
-- ROW LEVEL SECURITY
-- Cada usuário só acessa seus próprios dados de progresso/tentativas.
-- Conteúdo "global" (vocabulary_cards, scenarios, speaking_prompts,
-- interview_questions) é de leitura pública para qualquer usuário autenticado.
-- =============================================================================

alter table vocabulary_cards enable row level security;
alter table user_vocabulary_progress enable row level security;
alter table scenarios enable row level security;
alter table scenario_attempts enable row level security;
alter table email_corrections enable row level security;
alter table speaking_prompts enable row level security;
alter table speaking_attempts enable row level security;
alter table interview_questions enable row level security;
alter table interview_attempts enable row level security;
alter table daily_activity enable row level security;

-- Conteúdo global: leitura pública para qualquer usuário autenticado
create policy "vocabulary_cards_select_authenticated" on vocabulary_cards
  for select to authenticated using (true);

create policy "scenarios_select_authenticated" on scenarios
  for select to authenticated using (true);

create policy "speaking_prompts_select_authenticated" on speaking_prompts
  for select to authenticated using (true);

create policy "interview_questions_select_authenticated" on interview_questions
  for select to authenticated using (true);

-- Dados pessoais: usuário só vê e modifica os próprios registros
create policy "user_vocabulary_progress_owner" on user_vocabulary_progress
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "scenario_attempts_owner" on scenario_attempts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "email_corrections_owner" on email_corrections
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "speaking_attempts_owner" on speaking_attempts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "interview_attempts_owner" on interview_attempts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "daily_activity_owner" on daily_activity
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
