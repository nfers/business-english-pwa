# PRD: Business English PWA — App pessoal de inglês para trabalho e entrevistas técnicas

**Status:** Rascunho v2
**Autor:** Nay
**Data:** Junho 2026
**Changelog v2:** Vocabulário expandido para cobrir A1-C2 (não só termos de negócios); adicionada seção de entrevista técnica simulada (P0.6)

---

## 1. Problem Statement

Nay é falante nativo de português brasileiro, está no nível B1-B2 de inglês e precisa elevar sua fluência para o nível profissional com urgência, principalmente em cenários de trabalho (reuniões, emails, apresentações) e entrevistas técnicas em inglês. Apps genéricos de aprendizado de idiomas (Duolingo, Babbel) ensinam vocabulário e gramática geral, mas não treinam o vocabulário, os formatos e as situações específicas do dia a dia corporativo em inglês, nem preparam para o tipo de comunicação exigida numa entrevista técnica (explicar decisões, descrever um projeto, discutir trade-offs). Isso cria uma lacuna: a pessoa pode "saber inglês" mas ainda hesitar ou cometer erros em um email formal, numa negociação de prazo, ao falar em uma reunião ou ao ser avaliado tecnicamente em inglês — situações onde o custo de errar é alto (profissional e reputacional).

## 2. Goals

1. Reduzir o tempo de preparo/hesitação de Nay para escrever emails profissionais em inglês (meta: sentir confiança para escrever um email de trabalho sem precisar de tradutor externo).
2. Aumentar a precisão gramatical e de vocabulário corporativo via prática recorrente de spaced repetition (meta: revisão diária consistente, medida por streak/sessões completas por semana).
3. Desenvolver fluência oral mínima viável para reuniões — capacidade de gravar uma resposta falada a um cenário de trabalho e receber feedback estruturado.
4. Validar o conceito do produto com uso pessoal diário antes de considerar abrir para outros usuários.

## 3. Non-Goals

- **Não vai oferecer certificação ou preparação para provas (TOEFL/IELTS) nesta versão.** Objetivo é fluência prática, não certificação formal.
- **A seção de entrevistas não cobre entrevistas comportamentais genéricas ("fale sobre você") como foco principal.** Foco é entrevista técnica de tecnologia/produto. Perguntas comportamentais podem aparecer de forma incidental, mas não são o objetivo central da seção.
- **Não vai ter análise fonética avançada (scoring de pronúncia por fonema) no MVP.** Speaking practice no MVP usa transcrição + feedback de IA sobre clareza/gramática/vocabulário, não scoring acústico detalhado (custo e complexidade técnica alta demais para v1).
- **Não será multiusuário com onboarding público no MVP.** Arquitetura já prevê isso (auth via Supabase), mas o lançamento para outros usuários é uma decisão pós-validação pessoal, não parte deste PRD.
- **Não vai integrar com calendário/email reais (ex: ler reuniões do Google Calendar) nesta versão.** Cenários são simulados, não conectados a dados reais do usuário.

## 4. User Stories

**Persona única no MVP: Nay (usuário B1-B2 buscando fluência profissional)**

1. Como usuário, quero estudar vocabulário de negócios com spaced repetition para reter termos e expressões corporativas a longo prazo.
2. Como usuário, quero praticar cenários simulados de trabalho (reunião, negociação, follow-up) escrevendo respostas, para treinar como reagir em situações reais.
3. Como usuário, quero colar um rascunho de email e receber correções com explicação do erro, para aprender enquanto resolvo uma necessidade real de trabalho.
4. Como usuário, quero gravar minha voz respondendo a um cenário falado e receber feedback sobre clareza, gramática e vocabulário, para treinar fluência oral antes de reuniões reais.
5. Como usuário, quero ouvir trechos de áudio em contexto de negócios e responder perguntas de compreensão, para treinar listening.
6. Como usuário, quero praticar perguntas de entrevista técnica em inglês (ex: explicar um projeto, justificar uma decisão de arquitetura, discutir trade-offs) para chegar preparado em processos seletivos internacionais.
7. Como usuário, quero ver meu progresso (streak, palavras aprendidas, sessões completas) para manter motivação e identificar pontos fracos.
8. Como usuário, quero acessar o app do celular como um PWA instalável, para praticar em qualquer lugar sem depender de loja de apps.
9. Como usuário, quero que o app funcione mesmo se a API de IA estiver indisponível momentaneamente (ex: vocabulário e listening continuam funcionando), para não travar completamente meu fluxo de estudo.

## 5. Requirements

### Must-Have (P0)

**P0.1 — Autenticação e perfil**
- Login via Supabase Auth (email/senha ou magic link)
- Dados isolados por usuário desde o início (mesmo com 1 usuário real)
- Acceptance criteria:
  - [ ] Usuário consegue criar conta e logar
  - [ ] Sessão persiste entre visitas (PWA)
  - [ ] Dados de progresso ficam vinculados ao user_id

**P0.2 — Vocabulário com spaced repetition (A1 a C2)**
- Banco de termos/expressões cobrindo desde vocabulário geral do dia a dia (A1-A2) até vocabulário avançado de negócios (B1-C2), numa trilha única (curado inicialmente, sem IA)
- Cada card tem um nível de dificuldade associado (A1, A2, B1, B2, C1, C2)
- Algoritmo de repetição espaçada (ex: SM-2 simplificado)
- Acceptance criteria:
  - [ ] Usuário revisa cards e marca "lembrei fácil/difícil/não lembrei"
  - [ ] Sistema recalcula próxima data de revisão por card
  - [ ] Cards atrasados aparecem primeiro na fila do dia
  - [ ] Cards de diferentes níveis aparecem misturados na mesma trilha, mas o nível é visível/filtrável

**P0.3 — Simulador de cenários (texto)**
- Prompts de cenário (ex: "seu projeto vai atrasar, escreva um update para o cliente")
- Usuário escreve resposta em texto
- Gemini Flash avalia e dá feedback (gramática, tom, clareza, vocabulário sugerido)
- Acceptance criteria:
  - [ ] Usuário seleciona um cenário de uma lista categorizada
  - [ ] Usuário escreve resposta livre
  - [ ] Sistema retorna feedback estruturado em <10s na maioria das vezes
  - [ ] Se a API falhar, usuário vê mensagem de erro clara (não tela quebrada)

**P0.4 — Correção de email/texto**
- Campo de texto livre para colar rascunho
- Gemini Flash retorna versão corrigida + lista de erros explicados
- Acceptance criteria:
  - [ ] Usuário cola texto e recebe correção + explicação de cada mudança
  - [ ] Sistema diferencia erro gramatical de sugestão de tom/estilo

**P0.5 — Speaking practice (versão simplificada)**
- Gravação de áudio via MediaRecorder (browser)
- Transcrição via API (Gemini ou Web Speech API)
- Feedback de IA sobre a transcrição (clareza, gramática, vocabulário) — sem scoring fonético
- Acceptance criteria:
  - [ ] Usuário grava resposta a um prompt falado
  - [ ] Sistema transcreve e mostra o texto
  - [ ] Sistema dá feedback textual sobre a fala
  - [ ] Funciona em mobile (PWA) e desktop

**P0.6 — Entrevista técnica simulada**
- Banco de perguntas típicas de entrevista técnica (explicar projeto, decisões de arquitetura, trade-offs, perguntas de "conte sobre uma vez que...")
- Usuário responde por texto ou por voz (reusa o pipeline de gravação/transcrição do P0.5)
- Gemini Flash avalia clareza da explicação técnica, gramática e estrutura da resposta (ex: STAR method quando aplicável)
- Acceptance criteria:
  - [ ] Usuário seleciona uma pergunta de entrevista técnica de uma lista
  - [ ] Usuário responde em texto ou áudio
  - [ ] Sistema dá feedback sobre clareza, estrutura e gramática da resposta
  - [ ] Perguntas cobrem temas comuns de tech/produto (arquitetura, decisões técnicas, resolução de problemas)

**P0.7 — Tracking de progresso básico**
- Streak diário, total de cards revisados, sessões completadas por tipo de exercício (incluindo entrevistas)
- Acceptance criteria:
  - [ ] Dashboard simples mostra streak atual e atividade da semana
  - [ ] Dados batem com o histórico real de uso

**P0.8 — PWA instalável**
- Manifest.json + service worker básico
- Funciona offline para vocabulário (cards já carregados)
- Acceptance criteria:
  - [ ] App pode ser "adicionado à tela inicial" no mobile
  - [ ] Revisão de vocabulário funciona sem internet (dados sincronizam depois)

### Nice-to-Have (P1)

**P1.1 — Listening practice**
- Áudio gerado via TTS (Gemini ou outro) a partir de diálogos de negócios
- Perguntas de compreensão após o áudio
- Por que P1: agrega valor mas o core (vocabulário + cenários + speaking) já cobre o objetivo principal.

**P1.2 — Histórico de sessões de feedback**
- Ver feedbacks anteriores de email/cenário/speaking para acompanhar evolução ao longo do tempo
- Por que P1: importante para sentir progresso, mas não bloqueia o uso do MVP.

**P1.3 — Categorização de cenários por situação real (reunião 1:1, all-hands, negociação, etc.)**
- Por que P1: melhora relevância, mas uma lista simples de cenários já é funcional no P0.

### Future Considerations (P2)

**P2.1 — Multiusuário público com onboarding**
- Considerar billing, limites de uso de API por usuário, moderação de conteúdo gerado.

**P2.2 — Análise fonética avançada de pronúncia**
- Scoring por fonema (ex: via Azure Pronunciation Assessment ou similar) — custo e complexidade altos, vale revisitar se o produto validar.

**P2.3 — Provider de IA configurável/plugável**
- Hoje hardcoded para Gemini Flash. Estrutura de código deve isolar as chamadas de IA numa camada própria (ex: `lib/ai/`) para facilitar troca de provider no futuro, sem reescrever a aplicação.

**P2.4 — Integração com fontes reais (calendário, email)**
- Trazer contexto real do usuário para os cenários, ao invés de simulações genéricas.

## 6. Success Metrics

### Leading Indicators
- **Consistência de uso**: dias ativos por semana (meta: 5+ dias/semana nas primeiras 4 semanas)
- **Taxa de conclusão de exercício**: % de sessões de cenário/speaking iniciadas que são concluídas (meta: 80%+)
- **Latência de feedback de IA**: tempo de resposta do Gemini para correção/feedback (meta: <10s p95)

### Lagging Indicators
- **Sensação subjetiva de confiança**: autoavaliação mensal de Nay sobre confiança em escrever/falar em contextos de trabalho (escala simples 1-5)
- **Volume de vocabulário retido**: número de cards de vocabulário em estado "dominado" pelo algoritmo de repetição espaçada após 90 dias

### Medição
- Métricas de uso (streak, sessões, latência) vêm do banco Supabase diretamente.
- Confiança subjetiva é autoavaliação simples, registrada mensalmente dentro do próprio app ou em nota pessoal.

## 7. Open Questions

- **[Produto/Nay]** Quantos cenários, termos de vocabulário (por nível A1-C2) e perguntas de entrevista técnica precisam existir no lançamento do MVP para a experiência não parecer vazia? (sugestão inicial: ~80-100 termos distribuídos entre os níveis, ~15 cenários, ~20 perguntas de entrevista técnica, mas precisa validar)
- **[Engenharia]** Web Speech API (gratuita, nativa do browser) é suficiente para transcrição, ou vale usar a API do Gemini para isso também desde já? Web Speech API tem suporte inconsistente entre browsers/mobile.
- **[Engenharia]** Qual o limite do free tier do Gemini Flash em uso diário real? Precisa validar se aguenta o volume de uso pessoal sem hit de rate limit.
- **[Produto/Nay]** O conteúdo de vocabulário/cenários iniciais será curado manualmente por você, ou quer que eu gere uma base inicial (ex: 50 termos + 15 cenários) como parte do desenvolvimento?

## 8. Timeline Considerations

- Não há deadline contratual, mas a motivação é "urgência" pessoal — sugestão de fasear o desenvolvimento para ter algo utilizável rapidamente:
  - **Fase 1 (semana 1-2):** Auth + Vocabulário (A1-C2) + PWA básico → já dá pra começar a usar diariamente
  - **Fase 2 (semana 2-3):** Simulador de cenários + Correção de email (dependem da integração Gemini)
  - **Fase 3 (semana 3-4):** Speaking practice + Entrevista técnica simulada (reaproveitam o mesmo pipeline de áudio — maior risco técnico, isolar por último)
  - **Fase 4:** Listening + polimento de tracking (P1)
- Dependência externa: free tier do Gemini API precisa estar configurado e validado antes da Fase 2.
