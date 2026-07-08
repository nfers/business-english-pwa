"use client";

import { useState } from "react";
import { AudioButton } from "@/components/ui/audio-button";

export interface FlashcardData {
  id: string;
  term: string;
  translation_pt: string;
  example_sentence: string | null;
  level: string;
}

interface FlashcardProps {
  card: FlashcardData;
  onAnswer: (quality: "again" | "hard" | "good" | "easy") => void;
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "var(--color-good)",
  A2: "var(--color-good)",
  B1: "var(--color-accent)",
  B2: "var(--color-accent)",
  C1: "var(--color-warn)",
  C2: "var(--color-warn)",
};

export function Flashcard({ card, onAnswer }: FlashcardProps) {
  const [revealed, setRevealed] = useState(false);

  function handleAnswer(quality: "again" | "hard" | "good" | "easy") {
    onAnswer(quality);
    setRevealed(false);
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 min-h-[280px] flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <span
          className="text-xs font-semibold tracking-wide px-2 py-1 rounded-md"
          style={{
            color: LEVEL_COLORS[card.level] ?? "var(--color-accent)",
            backgroundColor: "var(--color-bg)",
          }}
        >
          {card.level}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
        <div className="flex items-center gap-2">
          <p className="font-display text-2xl font-semibold">{card.term}</p>
          <AudioButton text={card.term} />
        </div>

        {revealed ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg text-[var(--color-accent)]">{card.translation_pt}</p>
            {card.example_sentence && (
              <>
                <p className="text-sm text-[var(--color-fg-muted)] italic max-w-xs">
                  &ldquo;{card.example_sentence}&rdquo;
                </p>
                <AudioButton text={card.example_sentence} label="Ouvir frase" />
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="text-sm font-medium text-[var(--color-fg-muted)] underline underline-offset-4 hover:text-[var(--color-fg)]"
          >
            Toque para revelar
          </button>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-4 gap-2 mt-6">
          <AnswerButton label="De novo" onClick={() => handleAnswer("again")} variant="warn" />
          <AnswerButton label="Difícil" onClick={() => handleAnswer("hard")} variant="neutral" />
          <AnswerButton label="Bom" onClick={() => handleAnswer("good")} variant="accent" />
          <AnswerButton label="Fácil" onClick={() => handleAnswer("easy")} variant="good" />
        </div>
      )}
    </div>
  );
}

function AnswerButton({
  label,
  onClick,
  variant,
}: {
  label: string;
  onClick: () => void;
  variant: "warn" | "neutral" | "accent" | "good";
}) {
  const colors: Record<string, string> = {
    warn: "var(--color-warn)",
    neutral: "var(--color-fg-muted)",
    accent: "var(--color-accent)",
    good: "var(--color-good)",
  };

  return (
    <button
      onClick={onClick}
      className="rounded-lg border py-2 text-xs font-medium transition-colors hover:opacity-80"
      style={{ borderColor: colors[variant], color: colors[variant] }}
    >
      {label}
    </button>
  );
}
