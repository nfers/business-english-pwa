"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { incrementDailyActivity } from "@/lib/supabase/activity-tracking";
import { useAIFeedback } from "@/lib/hooks/use-ai-feedback";
import { Card } from "@/components/ui/card";
import type { EmailCorrectionFeedback } from "@/lib/ai/email-correction";

const ISSUE_TYPE_LABEL: Record<string, string> = {
  grammar: "Gramática",
  style: "Estilo",
  tone: "Tom",
};

export default function EmailReviewPage() {
  const [text, setText] = useState("");
  const { feedback, isLoading, error, submit } = useAIFeedback<EmailCorrectionFeedback>({
    endpoint: "/api/ai/email-correction",
  });

  async function handleSubmit() {
    if (text.trim().length === 0) return;

    await submit({ originalText: text });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await incrementDailyActivity(supabase, user.id, "emails_corrected");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--color-fg-muted)] mb-1">Correção de texto</p>
        <h1 className="font-display text-2xl font-semibold">Cole seu rascunho de email</h1>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Cole aqui o email ou texto que você escreveu em inglês..."
        rows={8}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 text-sm outline-none focus:border-[var(--color-accent)] resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={isLoading || text.trim().length === 0}
        className="self-start rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {isLoading ? "Corrigindo..." : "Corrigir texto"}
      </button>

      {error && (
        <Card className="border-[var(--color-warn)]">
          <p className="text-sm text-[var(--color-warn)]">{error}</p>
        </Card>
      )}

      {feedback && (
        <Card className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Versão corrigida</p>
            <p className="text-sm whitespace-pre-wrap">{feedback.corrected_text}</p>
          </div>

          {feedback.issues.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[var(--color-fg-muted)]">Mudanças sugeridas</p>
              {feedback.issues.map((issue, i) => (
                <div key={i} className="text-sm border-l-2 border-[var(--color-warn)] pl-3">
                  <span className="text-[10px] uppercase font-semibold text-[var(--color-fg-muted)]">
                    {ISSUE_TYPE_LABEL[issue.type] ?? issue.type}
                  </span>
                  <p className="line-through text-[var(--color-fg-muted)]">{issue.original}</p>
                  <p className="text-[var(--color-good)]">{issue.suggestion}</p>
                  <p className="text-xs text-[var(--color-fg-muted)] mt-1">{issue.explanation}</p>
                </div>
              ))}
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Sobre o estilo</p>
            <p className="text-sm">{feedback.style_notes}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
