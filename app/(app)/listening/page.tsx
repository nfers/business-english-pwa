"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { incrementDailyActivity } from "@/lib/supabase/activity-tracking";
import { useAIFeedback } from "@/lib/hooks/use-ai-feedback";
import { useTTS } from "@/lib/speech/use-tts";
import { Card } from "@/components/ui/card";
import { Play, Turtle, CheckCircle2, XCircle } from "lucide-react";
import type { ListeningExercise } from "@/lib/ai/listening-exercise";

type Mode = "comprehension" | "dictation";
type Level = "A2" | "B1" | "B2" | "C1";

const LEVELS: Level[] = ["A2", "B1", "B2", "C1"];

const TOPICS = [
  "daily standup de um time de desenvolvimento",
  "reunião de alinhamento com um cliente",
  "feedback de desempenho entre gestora e desenvolvedora",
  "negociação de prazo de entrega de um projeto",
  "discussão sobre um bug em produção",
  "planejamento de sprint",
  "small talk de escritório antes de uma reunião",
  "apresentação rápida de resultados do trimestre",
];

function randomTopic() {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

/** Normaliza um token para comparação tolerante (caixa e pontuação ignoradas). */
function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9']/g, "");
}

/**
 * Marca quais palavras da frase-alvo apareceram (em ordem) na tentativa,
 * usando a maior subsequência comum — tolera palavras faltando ou extras.
 */
function matchTargetWords(targetTokens: string[], attemptText: string): boolean[] {
  const target = targetTokens.map(normalizeToken);
  const attempt = attemptText.split(/\s+/).map(normalizeToken).filter(Boolean);
  const m = target.length;
  const n = attempt.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] =
        target[i] !== "" && target[i] === attempt[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const matched = Array<boolean>(m).fill(false);
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (target[i] !== "" && target[i] === attempt[j]) {
      matched[i] = true;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }

  // Tokens que são só pontuação contam como acertados.
  return matched.map((hit, k) => (target[k] === "" ? true : hit));
}

function trackListening() {
  const supabase = createClient();
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) incrementDailyActivity(supabase, user.id, "listening_attempts");
  });
}

export default function ListeningPage() {
  const [mode, setMode] = useState<Mode>("comprehension");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--color-fg-muted)] mb-1">Escuta</p>
        <h1 className="font-display text-2xl font-semibold">Treine seu listening</h1>
      </div>

      <div className="grid grid-cols-2 rounded-lg border border-[var(--color-border)] p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("comprehension")}
          className={[
            "rounded-md py-2 transition-colors",
            mode === "comprehension"
              ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg)]"
              : "text-[var(--color-fg-muted)]",
          ].join(" ")}
        >
          Compreensão
        </button>
        <button
          type="button"
          onClick={() => setMode("dictation")}
          className={[
            "rounded-md py-2 transition-colors",
            mode === "dictation"
              ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg)]"
              : "text-[var(--color-fg-muted)]",
          ].join(" ")}
        >
          Ditado
        </button>
      </div>

      {mode === "comprehension" ? <ComprehensionMode /> : <DictationMode />}
    </div>
  );
}

function PlayControls({ text }: { text: string }) {
  const { speak, isSpeaking, isSupported } = useTTS();

  if (!isSupported) {
    return (
      <Card className="border-[var(--color-warn)]">
        <p className="text-sm text-[var(--color-warn)]">
          Seu navegador não tem suporte a leitura em voz alta (SpeechSynthesis). Tente o Google
          Chrome.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        type="button"
        onClick={() => speak(text)}
        disabled={isSpeaking}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] transition-opacity disabled:opacity-60"
        aria-label="Ouvir áudio"
      >
        <Play size={24} color="white" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => speak(text, { rate: 0.7 })}
        disabled={isSpeaking}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-accent)] disabled:opacity-60"
        aria-label="Ouvir devagar"
        title="Ouvir devagar"
      >
        <Turtle size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

function ComprehensionMode() {
  const [level, setLevel] = useState<Level>("B1");
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const {
    feedback: exercise,
    isLoading,
    error,
    submit,
    reset,
  } = useAIFeedback<ListeningExercise>({ endpoint: "/api/ai/listening-exercise" });

  async function loadExercise() {
    setSelected(null);
    await submit({ level, topic: randomTopic() });
  }

  function handleSelect(index: number) {
    if (!exercise || selected !== null) return;
    setSelected(index);
    setScore((s) => ({
      correct: s.correct + (index === exercise.correct_index ? 1 : 0),
      total: s.total + 1,
    }));
    trackListening();
  }

  const answered = selected !== null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={[
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                l === level
                  ? "bg-[var(--color-accent)] text-white"
                  : "border border-[var(--color-border)] text-[var(--color-fg-muted)]",
              ].join(" ")}
            >
              {l}
            </button>
          ))}
        </div>
        {score.total > 0 && (
          <span className="text-xs text-[var(--color-fg-muted)]">
            Acertos: {score.correct}/{score.total}
          </span>
        )}
      </div>

      {!exercise && !isLoading && (
        <Card>
          <p className="text-sm text-[var(--color-fg-muted)] mb-4">
            Você vai ouvir um trecho curto de uma situação de trabalho em inglês — sem ver o
            texto — e responder uma pergunta sobre ele.
          </p>
          <button
            type="button"
            onClick={loadExercise}
            className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white"
          >
            Gerar exercício
          </button>
        </Card>
      )}

      {isLoading && <p className="text-sm text-[var(--color-fg-muted)]">Gerando exercício...</p>}

      {error && (
        <Card className="border-[var(--color-warn)]">
          <p className="text-sm text-[var(--color-warn)]">{error}</p>
        </Card>
      )}

      {exercise && !isLoading && (
        <>
          <Card>
            <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1 text-center">
              Toque para ouvir (a tartaruga toca devagar)
            </p>
            <PlayControls text={exercise.audio_text} />
          </Card>

          <Card className="flex flex-col gap-3">
            <p className="text-sm font-medium">{exercise.question}</p>
            {exercise.options.map((option, index) => {
              const isCorrect = index === exercise.correct_index;
              const isSelected = index === selected;
              const stateClass = !answered
                ? "border-[var(--color-border)] hover:border-[var(--color-accent)]"
                : isCorrect
                  ? "border-[var(--color-good)] text-[var(--color-good)]"
                  : isSelected
                    ? "border-[var(--color-warn)] text-[var(--color-warn)]"
                    : "border-[var(--color-border)] opacity-60";

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(index)}
                  disabled={answered}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${stateClass}`}
                >
                  {answered && isCorrect && <CheckCircle2 size={16} aria-hidden="true" />}
                  {answered && isSelected && !isCorrect && <XCircle size={16} aria-hidden="true" />}
                  <span>{option}</span>
                </button>
              );
            })}
          </Card>

          {answered && (
            <Card className="flex flex-col gap-3">
              <p
                className={[
                  "text-sm font-semibold",
                  selected === exercise.correct_index
                    ? "text-[var(--color-good)]"
                    : "text-[var(--color-warn)]",
                ].join(" ")}
              >
                {selected === exercise.correct_index ? "Você acertou! 🎉" : "Não foi dessa vez."}
              </p>
              <div>
                <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">
                  O que o áudio dizia
                </p>
                <p className="text-sm italic">&ldquo;{exercise.audio_text}&rdquo;</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-fg-muted)] mb-1">Explicação</p>
                <p className="text-sm">{exercise.explanation_pt}</p>
              </div>
              <button
                type="button"
                onClick={loadExercise}
                className="self-start rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white"
              >
                Próximo exercício
              </button>
            </Card>
          )}

          {!answered && (
            <button
              type="button"
              onClick={() => {
                reset();
                setSelected(null);
              }}
              className="self-start text-sm text-[var(--color-fg-muted)] underline underline-offset-4 hover:text-[var(--color-fg)]"
            >
              Trocar de exercício
            </button>
          )}
        </>
      )}
    </div>
  );
}

interface DictationSentence {
  id: string;
  sentence: string;
  level: string;
}

function DictationMode() {
  const [sentences, setSentences] = useState<DictationSentence[] | null>(null);
  const [current, setCurrent] = useState<DictationSentence | null>(null);
  const [attempt, setAttempt] = useState("");
  const [result, setResult] = useState<{ matched: boolean[]; accuracy: number } | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("vocabulary_cards")
      .select("id, example_sentence, level")
      .not("example_sentence", "is", null)
      .then(({ data }) => {
        if (!active) return;
        const list = (data ?? [])
          .filter((c) => c.example_sentence && c.example_sentence.trim().length > 0)
          .map((c) => ({ id: c.id, sentence: c.example_sentence as string, level: c.level }));
        setSentences(list);
      });
    return () => {
      active = false;
    };
  }, []);

  function nextSentence(list: DictationSentence[]) {
    const pool = list.filter((s) => s.id !== current?.id);
    const pick = (pool.length > 0 ? pool : list)[Math.floor(Math.random() * (pool.length || list.length))];
    setCurrent(pick);
    setAttempt("");
    setResult(null);
  }

  function handleCheck() {
    if (!current || attempt.trim().length === 0) return;
    const tokens = current.sentence.split(/\s+/);
    const matched = matchTargetWords(tokens, attempt);
    const relevant = tokens.filter((t) => normalizeToken(t) !== "");
    const hits = tokens.filter((t, i) => normalizeToken(t) !== "" && matched[i]);
    const accuracy = relevant.length > 0 ? Math.round((hits.length / relevant.length) * 100) : 0;
    setResult({ matched, accuracy });
    trackListening();
  }

  if (sentences === null) {
    return <p className="text-sm text-[var(--color-fg-muted)]">Carregando frases...</p>;
  }

  if (sentences.length === 0) {
    return (
      <Card>
        <p className="text-sm">Nenhuma frase de exemplo disponível no vocabulário ainda.</p>
      </Card>
    );
  }

  if (!current) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-fg-muted)] mb-4">
          Você vai ouvir uma frase em inglês e digitar exatamente o que ouviu. A correção mostra
          palavra por palavra o que você pegou.
        </p>
        <button
          type="button"
          onClick={() => nextSentence(sentences)}
          className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white"
        >
          Começar
        </button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--color-fg-muted)]">
            Ouça e digite o que entendeu
          </p>
          <span className="text-xs font-semibold text-[var(--color-accent)]">{current.level}</span>
        </div>
        <PlayControls text={current.sentence} />
      </Card>

      <textarea
        value={attempt}
        onChange={(e) => setAttempt(e.target.value)}
        placeholder="Digite aqui o que você ouviu..."
        rows={3}
        disabled={result !== null}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] disabled:opacity-70"
      />

      {result === null ? (
        <button
          type="button"
          onClick={handleCheck}
          disabled={attempt.trim().length === 0}
          className="self-start rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Corrigir
        </button>
      ) : (
        <Card className="flex flex-col gap-3">
          <p
            className={[
              "text-sm font-semibold",
              result.accuracy === 100
                ? "text-[var(--color-good)]"
                : result.accuracy >= 70
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-warn)]",
            ].join(" ")}
          >
            {result.accuracy === 100
              ? "Perfeito! 100% 🎉"
              : `Você pegou ${result.accuracy}% das palavras`}
          </p>
          <p className="text-sm leading-relaxed">
            {current.sentence.split(/\s+/).map((token, i) => (
              <span
                key={i}
                className={
                  result.matched[i] ? "text-[var(--color-good)]" : "text-[var(--color-warn)] underline"
                }
              >
                {token}{" "}
              </span>
            ))}
          </p>
          <button
            type="button"
            onClick={() => nextSentence(sentences)}
            className="self-start rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white"
          >
            Próxima frase
          </button>
        </Card>
      )}
    </div>
  );
}
