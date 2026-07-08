"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { incrementDailyActivity } from "@/lib/supabase/activity-tracking";
import { useAIFeedback } from "@/lib/hooks/use-ai-feedback";
import { useVoiceRecording } from "@/lib/hooks/use-voice-recording";
import { Card } from "@/components/ui/card";
import { AudioButton } from "@/components/ui/audio-button";
import { Mic, Square, Keyboard } from "lucide-react";
import type { InterviewFeedback } from "@/lib/ai/interview-feedback";

interface InterviewQuestion {
  id: string;
  question_text: string;
  category: string;
  level: string;
}

export default function InterviewPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [current, setCurrent] = useState<InterviewQuestion | null>(null);
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [textResponse, setTextResponse] = useState("");

  const { isRecording, transcript, isSupported, startRecording, stopRecording, resetTranscript } =
    useVoiceRecording();
  const { feedback, isLoading, error, submit, reset } = useAIFeedback<InterviewFeedback>({
    endpoint: "/api/ai/interview-feedback",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("interview_questions")
      .select("id, question_text, category, level")
      .then(({ data }) => setQuestions(data ?? []));
  }, []);

  function handleSelectQuestion(question: InterviewQuestion) {
    setCurrent(question);
    setTextResponse("");
    resetTranscript();
    reset();
  }

  async function handleSubmit() {
    if (!current) return;
    const responseText = mode === "text" ? textResponse : transcript;
    if (responseText.trim().length === 0) return;

    await submit({
      questionId: current.id,
      questionText: current.question_text,
      responseText,
      responseMode: mode,
    });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await incrementDailyActivity(supabase, user.id, "interview_attempts");
    }
  }

  if (current) {
    const responseText = mode === "text" ? textResponse : transcript;

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
            <AudioButton text={current.question_text} label="Ouvir pergunta" />
          </div>
          <p className="text-sm mt-1">{current.question_text}</p>
        </Card>

        <div className="flex gap-2 self-start rounded-lg border border-[var(--color-border)] p-1">
          <ModeButton active={mode === "text"} onClick={() => setMode("text")} icon={Keyboard} label="Texto" />
          <ModeButton
            active={mode === "voice"}
            onClick={() => setMode("voice")}
            icon={Mic}
            label="Voz"
            disabled={!isSupported}
          />
        </div>

        {mode === "text" ? (
          <textarea
            value={textResponse}
            onChange={(e) => setTextResponse(e.target.value)}
            placeholder="Escreva sua resposta em inglês..."
            rows={6}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 text-sm outline-none focus:border-[var(--color-accent)] resize-none"
          />
        ) : (
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
            {transcript && (
              <Card className="w-full">
                <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Transcrição</p>
                <p className="text-sm">{transcript}</p>
              </Card>
            )}
          </div>
        )}

        {responseText.trim().length > 0 && !isRecording && (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="self-start rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {isLoading ? "Avaliando..." : "Enviar resposta"}
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
              <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Clareza técnica</p>
              <p className="text-sm">{feedback.clarity_notes}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Estrutura da resposta</p>
              <p className="text-sm">{feedback.structure_notes}</p>
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

            <div>
              <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Comentário do entrevistador</p>
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
        <p className="text-sm text-[var(--color-fg-muted)] mb-1">Entrevista técnica</p>
        <h1 className="font-display text-2xl font-semibold">Pratique suas respostas</h1>
      </div>

      {questions === null && (
        <p className="text-sm text-[var(--color-fg-muted)]">Carregando perguntas...</p>
      )}

      <div className="flex flex-col gap-3">
        {questions?.map((question) => (
          <button key={question.id} onClick={() => handleSelectQuestion(question)} className="text-left">
            <Card className="hover:border-[var(--color-accent)] transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[var(--color-accent)]">
                  {question.level}
                </span>
                <span className="text-xs text-[var(--color-fg-muted)]">{question.category}</span>
              </div>
              <p className="text-sm">{question.question_text}</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Mic;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
        active ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-fg-muted)]",
      ].join(" ")}
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </button>
  );
}
