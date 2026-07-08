"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { incrementDailyActivity } from "@/lib/supabase/activity-tracking";
import { useAIFeedback } from "@/lib/hooks/use-ai-feedback";
import { useVoiceRecording } from "@/lib/hooks/use-voice-recording";
import { Card } from "@/components/ui/card";
import { AudioButton } from "@/components/ui/audio-button";
import { Mic, Square } from "lucide-react";
import type { SpeakingFeedback } from "@/lib/ai/speaking-feedback";

interface SpeakingPrompt {
  id: string;
  prompt_text: string;
  category: string;
  level: string;
}

export default function SpeakingPage() {
  const [prompts, setPrompts] = useState<SpeakingPrompt[] | null>(null);
  const [current, setCurrent] = useState<SpeakingPrompt | null>(null);
  const { isRecording, transcript, isSupported, startRecording, stopRecording, resetTranscript } =
    useVoiceRecording();
  const { feedback, isLoading, error, submit, reset } = useAIFeedback<SpeakingFeedback>({
    endpoint: "/api/ai/speaking-feedback",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("speaking_prompts")
      .select("id, prompt_text, category, level")
      .then(({ data }) => setPrompts(data ?? []));
  }, []);

  function handleSelectPrompt(prompt: SpeakingPrompt) {
    setCurrent(prompt);
    resetTranscript();
    reset();
  }

  async function handleSubmit() {
    if (!current || transcript.trim().length === 0) return;

    await submit({
      promptId: current.id,
      promptText: current.prompt_text,
      transcript,
    });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await incrementDailyActivity(supabase, user.id, "speaking_attempts");
    }
  }

  if (!isSupported) {
    return (
      <Card className="border-[var(--color-warn)]">
        <p className="text-sm text-[var(--color-warn)]">
          Seu navegador não tem suporte ao reconhecimento de voz (Web Speech API). Tente usar o
          Google Chrome em um computador ou Android.
        </p>
      </Card>
    );
  }

  if (current) {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={() => setCurrent(null)}
          className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] self-start"
        >
          ← Voltar para a lista
        </button>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-accent)]">{current.level}</span>
            <AudioButton text={current.prompt_text} label="Ouvir pergunta" />
          </div>
          <p className="text-sm mt-1">{current.prompt_text}</p>
        </Card>

        <div className="flex flex-col items-center gap-4 py-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={[
              "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
              isRecording ? "bg-[var(--color-warn)]" : "bg-[var(--color-accent)]",
            ].join(" ")}
            aria-label={isRecording ? "Parar gravação" : "Iniciar gravação"}
          >
            {isRecording ? <Square size={22} color="white" /> : <Mic size={22} color="white" />}
          </button>
          <p className="text-xs text-[var(--color-fg-muted)]">
            {isRecording ? "Gravando... toque para parar" : "Toque para gravar sua resposta"}
          </p>
        </div>

        {transcript && (
          <Card>
            <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Transcrição</p>
            <p className="text-sm">{transcript}</p>
          </Card>
        )}

        {transcript && !isRecording && (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="self-start rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {isLoading ? "Avaliando..." : "Enviar para avaliação"}
          </button>
        )}

        {error && (
          <Card className="border-[var(--color-warn)]">
            <p className="text-sm text-[var(--color-warn)]">{error}</p>
          </Card>
        )}

        {feedback && (
          <Card className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Clareza</p>
              <p className="text-sm">{feedback.clarity_notes}</p>
            </div>

            {feedback.grammar_issues.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-[var(--color-fg-muted)]">Gramática</p>
                {feedback.grammar_issues.map((issue, i) => (
                  <div key={i} className="text-sm border-l-2 border-[var(--color-warn)] pl-3">
                    <p className="line-through text-[var(--color-fg-muted)]">{issue.original}</p>
                    <p className="text-[var(--color-good)]">{issue.suggestion}</p>
                    <p className="text-xs text-[var(--color-fg-muted)] mt-1">{issue.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {feedback.vocabulary_suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">
                  Vocabulário alternativo
                </p>
                <p className="text-sm">{feedback.vocabulary_suggestions.join(" · ")}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Comentário geral</p>
              <p className="text-sm">{feedback.overall_comment}</p>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--color-fg-muted)] mb-1">Speaking practice</p>
        <h1 className="font-display text-2xl font-semibold">Treine sua fala</h1>
      </div>

      {prompts === null && (
        <p className="text-sm text-[var(--color-fg-muted)]">Carregando prompts...</p>
      )}

      <div className="flex flex-col gap-3">
        {prompts?.map((prompt) => (
          <button key={prompt.id} onClick={() => handleSelectPrompt(prompt)} className="text-left">
            <Card className="hover:border-[var(--color-accent)] transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[var(--color-accent)]">
                  {prompt.level}
                </span>
                <span className="text-xs text-[var(--color-fg-muted)]">{prompt.category}</span>
              </div>
              <p className="text-sm">{prompt.prompt_text}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
