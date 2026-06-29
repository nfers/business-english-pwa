/**
 * Algoritmo de repetição espaçada — versão simplificada do SM-2.
 * Não depende de IA, funciona 100% offline (ver PRD P0.7/P0.8).
 */

export type ReviewQuality = "again" | "hard" | "good" | "easy";

export interface SpacedRepetitionState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

const QUALITY_SCORE: Record<ReviewQuality, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

const MIN_EASE_FACTOR = 1.3;

/**
 * Calcula o próximo estado de um card após uma revisão, baseado no SM-2.
 *
 * - "again": reseta o card, ele volta a aparecer no curto prazo.
 * - "hard"/"good"/"easy": aumentam o intervalo de revisão, com "easy"
 *   aumentando mais e ajustando o ease factor para cima.
 */
export function calculateNextReview(
  current: SpacedRepetitionState,
  quality: ReviewQuality
): SpacedRepetitionState & { nextReviewAt: Date } {
  const score = QUALITY_SCORE[quality];

  if (score < 3) {
    // Errou ou achou muito difícil: reinicia a progressão deste card.
    const nextReviewAt = new Date();
    nextReviewAt.setMinutes(nextReviewAt.getMinutes() + 10);

    return {
      easeFactor: Math.max(MIN_EASE_FACTOR, current.easeFactor - 0.2),
      intervalDays: 0,
      repetitions: 0,
      nextReviewAt,
    };
  }

  const newEaseFactor = Math.max(
    MIN_EASE_FACTOR,
    current.easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))
  );

  let newInterval: number;
  if (current.repetitions === 0) {
    newInterval = 1;
  } else if (current.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(current.intervalDays * newEaseFactor);
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    intervalDays: newInterval,
    repetitions: current.repetitions + 1,
    nextReviewAt,
  };
}

/** Estado inicial de um card que o usuário nunca revisou. */
export function initialState(): SpacedRepetitionState {
  return { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };
}
