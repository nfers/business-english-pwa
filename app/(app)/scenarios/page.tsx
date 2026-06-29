"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { incrementDailyActivity } from "@/lib/supabase/activity-tracking";
import { useAIFeedback } from "@/lib/hooks/use-ai-feedback";
import { Card } from "@/components/ui/card";
import type { ScenarioFeedback } from "@/lib/ai/scenario-feedback";

interface Scenario {
  id: string;
  title: string;
  prompt: string;
  category: string;
  level: string;
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[] | null>(null);
  const [selected, setSelected] = useState<Scenario | null>(null);
  const [response, setResponse] = useState("");
  const { feedback, isLoading, error, submit, reset } = useAIFeedback<ScenarioFeedback>({
    endpoint: "/api/ai/scenario-feedback",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("scenarios")
      .select("id, title, prompt, category, level")
      .then(({ data }) => setScenarios(data ?? []));
  }, []);

  async function handleSubmit() {
    if (!selected || response.trim().length === 0) return;

    await submit({
      scenarioId: selected.id,
      scenarioPrompt: selected.prompt,
      userResponse: response,
    });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await incrementDailyActivity(supabase, user.id, "scenarios_completed");
    }
  }

  function handleSelectScenario(scenario: Scenario) {
    setSelected(scenario);
    setResponse("");
    reset();
  }

  if (selected) {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={() => setSelected(null)}
          className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] self-start"
        >
          ← Voltar para a lista
        </button>

        <Card>
          <span className="text-xs font-semibold text-[var(--color-accent)]">{selected.level}</span>
          <h2 className="font-display text-lg font-semibold mt-1 mb-2">{selected.title}</h2>
          <p className="text-sm text-[var(--color-fg-muted)]">{selected.prompt}</p>
        </Card>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Escreva sua resposta em inglês..."
          rows={6}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 text-sm outline-none focus:border-[var(--color-accent)] resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={isLoading || response.trim().length === 0}
          className="self-start rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isLoading ? "Avaliando..." : "Enviar resposta"}
        </button>

        {error && (
          <Card className="border-[var(--color-warn)]">
            <p className="text-sm text-[var(--color-warn)]">{error}</p>
          </Card>
        )}

        {feedback && (
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Feedback</h3>
              <span className="text-sm font-semibold text-[var(--color-accent)]">
                {feedback.score}/10
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Versão sugerida</p>
              <p className="text-sm">{feedback.corrected_text}</p>
            </div>

            {feedback.issues.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-[var(--color-fg-muted)]">Pontos de atenção</p>
                {feedback.issues.map((issue, i) => (
                  <div key={i} className="text-sm border-l-2 border-[var(--color-warn)] pl-3">
                    <p className="line-through text-[var(--color-fg-muted)]">{issue.original}</p>
                    <p className="text-[var(--color-good)]">{issue.suggestion}</p>
                    <p className="text-xs text-[var(--color-fg-muted)] mt-1">{issue.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Sobre o tom</p>
              <p className="text-sm">{feedback.tone_notes}</p>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--color-fg-muted)] mb-1">Cenários</p>
        <h1 className="font-display text-2xl font-semibold">Simule uma situação de trabalho</h1>
      </div>

      {scenarios === null && (
        <p className="text-sm text-[var(--color-fg-muted)]">Carregando cenários...</p>
      )}

      {scenarios?.length === 0 && (
        <Card>
          <p className="text-sm">
            Nenhum cenário cadastrado ainda. Adicione cenários na tabela <code>scenarios</code> do
            Supabase para começar a praticar.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {scenarios?.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => handleSelectScenario(scenario)}
            className="text-left"
          >
            <Card className="hover:border-[var(--color-accent)] transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[var(--color-accent)]">
                  {scenario.level}
                </span>
                <span className="text-xs text-[var(--color-fg-muted)]">{scenario.category}</span>
              </div>
              <p className="font-medium text-sm">{scenario.title}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
