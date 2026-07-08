-- Contador de exercícios de escuta (página /listening) no resumo diário.
alter table daily_activity
  add column if not exists listening_attempts integer not null default 0;
