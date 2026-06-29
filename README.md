# Fluency Desk — PWA pessoal de inglês para o trabalho

App pessoal para elevar fluência em inglês com foco em contexto profissional:
vocabulário (A1-C2), simulação de cenários de trabalho, correção de email,
speaking practice e entrevista técnica simulada.

Stack: **Next.js (App Router) + Supabase (auth/banco) + Google Gemini (IA) + Vercel (deploy)**.

Veja o PRD completo em [`docs/PRD-business-english-pwa.md`](./docs/PRD-business-english-pwa.md).

## 1. Pré-requisitos

- Node.js 18+ instalado
- Uma conta gratuita no [Supabase](https://supabase.com)
- Uma chave de API gratuita do [Google AI Studio](https://aistudio.google.com/apikey) (Gemini)

## 2. Configurar o Supabase

1. Crie um novo projeto no [painel do Supabase](https://supabase.com/dashboard).
2. Vá em **SQL Editor** e rode, nesta ordem:
   - `supabase/migrations/0001_init.sql` (cria as tabelas e as políticas de segurança)
   - `supabase/migrations/0002_seed_content.sql` (popula vocabulário, cenários, prompts de speaking e perguntas de entrevista — conteúdo inicial para você revisar/editar depois)
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
4. Em **Authentication → Providers**, confirme que o login por **Email (Magic Link / OTP)** está habilitado (vem habilitado por padrão).
5. Em **Authentication → URL Configuration**, adicione a URL do seu app (ex: `http://localhost:3000` para testar local, e a URL da Vercel depois do deploy) em **Redirect URLs**.

## 3. Configurar o Gemini

1. Acesse [aistudio.google.com/apikey](https://aistudio.google.com/apikey) e gere uma chave gratuita.
2. Guarde essa chave — ela vai na variável `GEMINI_API_KEY`.

## 4. Rodar localmente

```bash
npm install
cp .env.example .env.local
# edite .env.local com suas chaves reais do Supabase e do Gemini
npm run dev
```

Acesse `http://localhost:3000` — você será redirecionado para `/login`.

## 5. Deploy na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Na tela de configuração, adicione as variáveis de ambiente (as mesmas do `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Clique em **Deploy**.
5. Depois do primeiro deploy, volte ao Supabase em **Authentication → URL Configuration** e adicione a URL da Vercel (ex: `https://seu-projeto.vercel.app`) em **Redirect URLs** — sem isso o magic link de login não vai funcionar em produção.

## 6. Estrutura do projeto

```
app/
├── (auth)/login/        → tela de login (magic link via Supabase)
├── (app)/               → telas autenticadas (dashboard, vocabulário, cenários, email, speaking, entrevista)
└── api/ai/              → API routes que chamam o Gemini (uma por feature de IA)

lib/
├── ai/                  → camada isolada de IA (troque de provider trocando só aqui — ver PRD P2.3)
├── spaced-repetition/   → algoritmo SM-2 (funciona 100% offline, sem IA)
├── supabase/            → clientes Supabase (browser, server, middleware)
└── hooks/               → hooks compartilhados (feedback de IA, gravação de voz)

supabase/migrations/     → schema do banco e conteúdo inicial (seed)
docs/                    → PRD e demais specs do produto
```

## 7. Próximos passos sugeridos

- Revisar e expandir o conteúdo inicial (vocabulário, cenários, perguntas de entrevista) nas tabelas do Supabase.
- Testar o fluxo de speaking practice em um navegador com suporte à Web Speech API (Chrome é o mais confiável).
- Acompanhar o uso do free tier do Gemini para garantir que não há rate limit no seu volume de uso diário.
