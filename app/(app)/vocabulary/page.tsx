"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function VocabularyPage() {
  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Busca cards cujo progresso está devido (ou nunca foi revisado).
    const { data: dueProgress, error: progressError } = await supabase
      .from("user_vocabulary_progress")
      .select("card_id, ease_factor, interval_days, repetitions")
      .eq("user_id", user.id)
      .lte("next_review_at", new Date().toISOString());

    if (progressError) {
      setError("Não foi possível carregar seu progresso. Tente recarregar a página.");
      return;
    }

    const dueCardIds = new Set(dueProgress?.map((p) => p.card_id) ?? []);

    const { data: allCards, error: cardsError } = await supabase
      .from("vocabulary_cards")
      .select("id, term, translation_pt, example_sentence, level");

    if (cardsError || !allCards) {
      setError("Não foi possível carregar o vocabulário. Tente recarregar a página.");
      return;
    }

    const { data: reviewedCardIds } = await supabase
      .from("user_vocabulary_progress")
      .select("card_id")
      .eq("user_id", user.id);

    const reviewedSet = new Set(reviewedCardIds?.map((r) => r.card_id) ?? []);

    const newCards = allCards.filter((c) => !reviewedSet.has(c.id)).slice(0, 10);
    const dueCards = allCards.filter((c) => dueCardIds.has(c.id));

    const items: QueueItem[] = [
      ...dueCards.map((card) => ({
        card,
        progress: dueProgress!.find((p) => p.card_id === card.id) ?? null,
      })),
      ...newCards.map((card) => ({ card, progress: null })),
    ];

    setQueue(items);
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  function handleAnswer(quality: ReviewQuality) {
    if (!queue || queue.length === 0) return;

    const [current, ...rest] = queue;
    setQueue(rest);
    persistAnswer(current, quality);
  }

  async function persistAnswer(current: QueueItem, quality: ReviewQuality) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const baseState = current.progress
      ? {
          easeFactor: current.progress.ease_factor,
          intervalDays: current.progress.interval_days,
          repetitions: current.progress.repetitions,
        }
      : initialState();

    const next = calculateNextReview(baseState, quality);

    await supabase.from("user_vocabulary_progress").upsert(
      {
        user_id: user.id,
        card_id: current.card.id,
        ease_factor: next.easeFactor,
        interval_days: next.intervalDays,
        repetitions: next.repetitions,
        next_review_at: next.nextReviewAt.toISOString(),
        last_reviewed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,card_id" }
    );

    await incrementDailyActivity(supabase, user.id, "vocabulary_reviews");
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
