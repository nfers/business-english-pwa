"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateNextReview, initialState, type ReviewQuality } from "@/lib/spaced-repetition/sm2";
import { incrementDailyActivity } from "@/lib/supabase/activity-tracking";
import { Flashcard, type FlashcardData } from "@/components/vocabulary/flashcard";
import { Card } from "@/components/ui/card";

interface QueueItem {
  card: FlashcardData;
  progress: {
    ease_factor: number;
    interval_days: number;
    repetitions: number;
  } | null;
}

const NEW_CARDS_PER_SESSION = 10;

/**
 * Monta a fila de revisão: cards devidos (next_review_at no passado) primeiro,
 * depois até NEW_CARDS_PER_SESSION cards nunca vistos. As duas queries rodam
 * em paralelo. Retorna null se não houver usuário logado.
 */
async function loadReviewQueue(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [progressResult, cardsResult] = await Promise.all([
    supabase
      .from("user_vocabulary_progress")
      .select("card_id, ease_factor, interval_days, repetitions, next_review_at")
      .eq("user_id", user.id),
    supabase
      .from("vocabulary_cards")
      .select("id, term, translation_pt, example_sentence, level"),
  ]);

  if (progressResult.error) {
    throw new Error("Não foi possível carregar seu progresso. Tente recarregar a página.");
  }

  if (cardsResult.error || !cardsResult.data) {
    throw new Error("Não foi possível carregar o vocabulário. Tente recarregar a página.");
  }

  const progressByCard = new Map(progressResult.data.map((p) => [p.card_id, p]));
  const now = Date.now();

  const dueItems: QueueItem[] = [];
  const newItems: QueueItem[] = [];

  for (const card of cardsResult.data) {
    const progress = progressByCard.get(card.id);
    if (!progress) {
      if (newItems.length < NEW_CARDS_PER_SESSION) {
        newItems.push({ card, progress: null });
      }
    } else if (new Date(progress.next_review_at).getTime() <= now) {
      dueItems.push({ card, progress });
    }
  }

  return { userId: user.id, items: [...dueItems, ...newItems] };
}

export default function VocabularyPage() {
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const userIdRef = useRef<string | null>(null);
  // Serializa as gravações em background: garante que uma resposta termina de
  // salvar antes da próxima começar, sem bloquear a UI entre um card e outro.
  const persistChain = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;

    loadReviewQueue(createClient())
      .then((result) => {
        if (!active || !result) return;
        userIdRef.current = result.userId;
        setQueue(result.items);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setError(
          e instanceof Error
            ? e.message
            : "Não foi possível carregar o vocabulário. Tente recarregar a página."
        );
      });

    return () => {
      active = false;
    };
  }, []);

  function handleAnswer(quality: ReviewQuality) {
    if (!queue || queue.length === 0) return;
    const userId = userIdRef.current;
    if (!userId) return;

    const [current, ...rest] = queue;

    // Avança para o próximo card imediatamente; a gravação roda em background.
    setQueue(rest);

    const baseState = current.progress
      ? {
          easeFactor: current.progress.ease_factor,
          intervalDays: current.progress.interval_days,
          repetitions: current.progress.repetitions,
        }
      : initialState();

    const next = calculateNextReview(baseState, quality);

    persistChain.current = persistChain.current.then(async () => {
      const supabase = createClient();
      const { error: upsertError } = await supabase.from("user_vocabulary_progress").upsert(
        {
          user_id: userId,
          card_id: current.card.id,
          ease_factor: next.easeFactor,
          interval_days: next.intervalDays,
          repetitions: next.repetitions,
          next_review_at: next.nextReviewAt.toISOString(),
          last_reviewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,card_id" }
      );

      if (upsertError) {
        setSaveError(true);
        return;
      }

      await incrementDailyActivity(supabase, userId, "vocabulary_reviews");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--color-fg-muted)] mb-1">Vocabulário</p>
        <h1 className="font-display text-2xl font-semibold">Revisão do dia</h1>
      </div>

      {error && (
        <Card className="border-[var(--color-warn)]">
          <p className="text-sm text-[var(--color-warn)]">{error}</p>
        </Card>
      )}

      {saveError && (
        <Card className="border-[var(--color-warn)]">
          <p className="text-sm text-[var(--color-warn)]">
            Algumas respostas não foram salvas por falha de conexão. Elas vão reaparecer na
            próxima revisão.
          </p>
        </Card>
      )}

      {!error && queue === null && (
        <p className="text-sm text-[var(--color-fg-muted)]">Carregando cards...</p>
      )}

      {!error && queue !== null && queue.length === 0 && (
        <Card>
          <p className="text-sm">
            Nenhum card pendente agora. Volte mais tarde ou amanhã para a próxima revisão.
          </p>
        </Card>
      )}

      {!error && queue !== null && queue.length > 0 && (
        <>
          <p className="text-xs text-[var(--color-fg-muted)]">
            {queue.length} {queue.length === 1 ? "card restante" : "cards restantes"}
          </p>
          <Flashcard card={queue[0].card} onAnswer={handleAnswer} />
        </>
      )}
    </div>
  );
}
