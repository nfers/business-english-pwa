-- =============================================================================
-- Seed de conteúdo inicial — base para revisão/curadoria de Nay.
-- Cobre vocabulário A1-C2, cenários de trabalho, prompts de speaking e
-- perguntas de entrevista técnica (produto/tecnologia).
-- Rode este arquivo DEPOIS da migration 0001_init.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- VOCABULARY — distribuído pelos 6 níveis CEFR
-- -----------------------------------------------------------------------------
insert into vocabulary_cards (term, translation_pt, example_sentence, level, category) values
-- A1 — vocabulário básico do dia a dia
('schedule', 'agenda / cronograma', 'Can you check my schedule for tomorrow?', 'A1', 'general'),
('meeting', 'reunião', 'We have a meeting at 10 AM.', 'A1', 'general'),
('email', 'email', 'I will send you an email later.', 'A1', 'general'),
('deadline', 'prazo final', 'The deadline is next Friday.', 'A1', 'general'),
('team', 'equipe', 'My team is working on a new project.', 'A1', 'general'),
('manager', 'gerente', 'My manager approved the request.', 'A1', 'general'),
('client', 'cliente', 'The client wants a faster response.', 'A1', 'general'),
('report', 'relatório', 'Please send the report by email.', 'A1', 'general'),
('task', 'tarefa', 'I finished my task for today.', 'A1', 'general'),
('project', 'projeto', 'This project is very important.', 'A1', 'general'),

-- A2 — vocabulário básico expandido
('to attend', 'participar de', 'I will attend the meeting tomorrow.', 'A2', 'general'),
('to postpone', 'adiar', 'We need to postpone the call.', 'A2', 'general'),
('available', 'disponível', 'Are you available this afternoon?', 'A2', 'general'),
('to confirm', 'confirmar', 'Can you confirm your attendance?', 'A2', 'general'),
('colleague', 'colega de trabalho', 'My colleague helped me with the report.', 'A2', 'general'),
('to update', 'atualizar', 'I need to update the spreadsheet.', 'A2', 'general'),
('reminder', 'lembrete', 'This is a reminder about our meeting.', 'A2', 'general'),
('to reschedule', 'reagendar', 'Can we reschedule for next week?', 'A2', 'general'),
('priority', 'prioridade', 'This task is a high priority.', 'A2', 'general'),
('to follow up', 'fazer um acompanhamento', 'I will follow up next week.', 'A2', 'general'),

-- B1 — transição para vocabulário de negócios
('to touch base', 'retomar contato / alinhar rapidamente', 'Let''s touch base on Monday.', 'B1', 'business'),
('to circle back', 'voltar a tratar de um assunto', 'I will circle back on this after lunch.', 'B1', 'business'),
('stakeholder', 'parte interessada', 'We need approval from all stakeholders.', 'B1', 'business'),
('to onboard', 'integrar (um novo funcionário)', 'We are onboarding a new developer next week.', 'B1', 'business'),
('bandwidth', 'disponibilidade/capacidade (figurado)', 'I don''t have the bandwidth for this right now.', 'B1', 'business'),
('to escalate', 'escalar (um problema)', 'We had to escalate the issue to management.', 'B1', 'business'),
('turnaround time', 'tempo de resposta/entrega', 'What is the turnaround time for this request?', 'B1', 'business'),
('to align on', 'alinhar sobre', 'Let''s align on the next steps.', 'B1', 'business'),
('action item', 'item de ação', 'Here are the action items from today''s meeting.', 'B1', 'business'),
('to loop in', 'incluir alguém numa conversa/decisão', 'Can you loop in the design team?', 'B1', 'business'),

-- B2 — vocabulário de negócios mais nuançado
('to streamline', 'simplificar/otimizar um processo', 'We streamlined our onboarding process.', 'B2', 'business'),
('to leverage', 'aproveitar/utilizar a favor', 'We should leverage existing data for this decision.', 'B2', 'business'),
('trade-off', 'compromisso entre opções (custo-benefício)', 'There is always a trade-off between speed and quality.', 'B2', 'business'),
('to mitigate', 'mitigar (um risco)', 'We need a plan to mitigate this risk.', 'B2', 'business'),
('low-hanging fruit', 'algo fácil de resolver com bom retorno', 'Let''s start with the low-hanging fruit.', 'B2', 'business'),
('to circle the wagons', 'unir esforços diante de um problema', 'The team circled the wagons before the launch.', 'B2', 'business'),
('actionable', 'algo que pode ser colocado em prática', 'We need actionable feedback, not just opinions.', 'B2', 'business'),
('to push back', 'discordar/resistir a algo', 'The client pushed back on the new pricing.', 'B2', 'business'),
('buy-in', 'apoio/concordância de stakeholders', 'We need buy-in from leadership before moving forward.', 'B2', 'business'),
('to table a discussion', 'pausar uma discussão para depois', 'Let''s table this discussion for next week.', 'B2', 'business'),

-- C1 — vocabulário avançado, nuances de negociação e liderança
('to spearhead', 'liderar/encabeçar uma iniciativa', 'She spearheaded the new product launch.', 'C1', 'business'),
('to be on the same page', 'estar alinhado/de acordo', 'Let''s make sure we''re on the same page before the call.', 'C1', 'business'),
('contingency plan', 'plano de contingência', 'We need a contingency plan in case the vendor fails.', 'C1', 'business'),
('to dovetail with', 'encaixar-se bem com / complementar', 'This initiative dovetails with our Q3 goals.', 'C1', 'business'),
('to gain traction', 'ganhar força/adesão', 'The new feature is gaining traction among users.', 'C1', 'business'),
('to second a proposal', 'apoiar formalmente uma proposta', 'I''d like to second that proposal.', 'C1', 'business'),
('to walk back a statement', 'recuar/retratar uma afirmação', 'He had to walk back his statement after the backlash.', 'C1', 'business'),
('underlying assumption', 'pressuposto subjacente', 'We need to question our underlying assumptions.', 'C1', 'business'),
('to course-correct', 'corrigir o rumo de uma estratégia', 'We need to course-correct before the next sprint.', 'C1', 'business'),
('to hedge', 'proteger-se contra um risco (de forma cautelosa)', 'His answer was hedged with a lot of caveats.', 'C1', 'business'),

-- C2 — vocabulário sofisticado, registro formal/diplomático
('to broach a subject', 'abordar um assunto delicado', 'I want to broach the subject of the budget cuts carefully.', 'C2', 'business'),
('tacit agreement', 'acordo tácito/implícito', 'There was a tacit agreement not to discuss the layoffs.', 'C2', 'business'),
('to temper expectations', 'moderar expectativas', 'We should temper expectations for this quarter.', 'C2', 'business'),
('to galvanize', 'mobilizar/energizar (uma equipe)', 'Her speech galvanized the entire team.', 'C2', 'business'),
('to play devil''s advocate', 'defender o lado contrário só para debate', 'Let me play devil''s advocate for a moment.', 'C2', 'business'),
('nuanced', 'sutil, com nuances', 'This requires a more nuanced approach.', 'C2', 'business'),
('to be at an impasse', 'estar num impasse', 'The negotiation reached an impasse.', 'C2', 'business'),
('to capitulate', 'ceder/capitular diante de pressão', 'The vendor eventually capitulated to our terms.', 'C2', 'business'),
('to substantiate a claim', 'fundamentar/comprovar uma afirmação', 'Can you substantiate that claim with data?', 'C2', 'business'),
('vested interest', 'interesse pessoal/direto em algo', 'He has a vested interest in this decision.', 'C2', 'business');

-- -----------------------------------------------------------------------------
-- SCENARIOS — simulador de cenários de texto
-- -----------------------------------------------------------------------------
insert into scenarios (title, prompt, category, level) values
('Atraso de projeto', 'Your project will be delayed by one week due to a technical issue. Write a short update message to your client explaining the delay and the new timeline.', 'follow_up', 'B1'),
('Pedido de prazo extra', 'You need two extra days to finish a task. Write a message to your manager asking for a deadline extension, explaining why.', 'negotiation', 'B1'),
('Recusa educada', 'A colleague asked you to join an extra project, but you don''t have time. Write a polite message declining the request.', 'negotiation', 'B2'),
('Status update de reunião', 'Write a short status update for a stand-up meeting, summarizing what you did yesterday, what you''ll do today, and any blockers.', 'meeting', 'B1'),
('Follow-up pós-reunião', 'After a meeting with a client, write a follow-up email summarizing the key points discussed and the next steps.', 'follow_up', 'B2'),
('Negociação de escopo', 'A stakeholder is asking for extra features that were not in the original scope. Write a message explaining the impact on timeline and negotiating next steps.', 'negotiation', 'B2'),
('Feedback construtivo', 'A teammate''s code review had several issues. Write a constructive feedback message that is clear but respectful.', 'meeting', 'B2'),
('Anúncio de mudança', 'Write a short announcement to your team about a change in the project timeline.', 'meeting', 'B1'),
('Pedido de esclarecimento', 'You received unclear requirements from a stakeholder. Write a message asking clarifying questions.', 'follow_up', 'B1'),
('Justificativa de decisão técnica', 'Explain to a non-technical stakeholder, in simple terms, why you chose a particular technical approach over another.', 'meeting', 'C1'),
('Pedido de aumento/promoção', 'Write a message to your manager requesting a 1:1 to discuss your performance and a potential promotion.', 'negotiation', 'C1'),
('Comunicado de bug crítico', 'A critical bug was found in production. Write an incident update message for stakeholders explaining the issue and next steps.', 'follow_up', 'B2'),
('Agradecimento profissional', 'A colleague helped you solve a difficult problem. Write a short message thanking them.', 'meeting', 'A2'),
('Apresentação de resultados', 'Write a short summary of quarterly results to present to leadership, highlighting key wins and challenges.', 'meeting', 'C1'),
('Resolução de conflito', 'Two team members disagree on a technical approach. Write a message proposing a way to resolve the disagreement constructively.', 'negotiation', 'C1');

-- -----------------------------------------------------------------------------
-- SPEAKING PROMPTS — prática de fala
-- -----------------------------------------------------------------------------
insert into speaking_prompts (prompt_text, category, level) values
('Introduce yourself as if you were joining a new team for the first time.', 'small_talk', 'A2'),
('Explain what your current job involves to someone who has never heard of your role.', 'small_talk', 'B1'),
('Give a one-minute summary of what you did this week at work.', 'meeting', 'B1'),
('Explain a technical decision you made recently and why you made it.', 'presentation', 'B2'),
('Describe a challenge you faced at work and how you solved it.', 'presentation', 'B2'),
('Explain the difference between two technologies or approaches you have worked with.', 'presentation', 'B2'),
('Give feedback out loud on a hypothetical teammate''s work, as if in a real conversation.', 'meeting', 'B2'),
('Explain why a project was delayed, as if speaking to a client on a call.', 'meeting', 'B2'),
('Describe your ideal next career step and why.', 'small_talk', 'B1'),
('Explain a trade-off you had to make between two good options at work.', 'presentation', 'C1');

-- -----------------------------------------------------------------------------
-- INTERVIEW QUESTIONS — entrevista técnica (produto/tecnologia)
-- -----------------------------------------------------------------------------
insert into interview_questions (question_text, category, level) values
('Walk me through a project you are proud of. What was your role and what was the outcome?', 'project_walkthrough', 'B2'),
('Tell me about a time you had to make a trade-off between speed and quality. How did you decide?', 'trade_offs', 'B2'),
('Describe a technical decision you disagreed with. How did you handle it?', 'trade_offs', 'C1'),
('How do you approach prioritizing tasks when everything seems urgent?', 'project_walkthrough', 'B1'),
('Explain how you would design a system to handle a sudden spike in traffic.', 'architecture', 'C1'),
('Tell me about a time a project did not go as planned. What did you learn?', 'project_walkthrough', 'B2'),
('How do you communicate a technical problem to a non-technical stakeholder?', 'project_walkthrough', 'B1'),
('Describe how you would approach migrating a legacy system to a new architecture.', 'architecture', 'C1'),
('Tell me about a time you had to give difficult feedback to a colleague.', 'project_walkthrough', 'B2'),
('What factors do you consider when choosing between building a feature in-house versus using a third-party service?', 'trade_offs', 'C1'),
('Describe a situation where you had to learn a new technology quickly. How did you approach it?', 'project_walkthrough', 'B1'),
('How would you explain technical debt to someone outside of engineering?', 'architecture', 'B2');
