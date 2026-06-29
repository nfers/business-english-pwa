"use client";

import { useState } from "react";

interface UseAIFeedbackOptions<TFeedback> {
  endpoint: string;
}

/**
 * Hook compartilhado para as 4 telas que chamam uma API route de IA
 * (cenários, email, speaking, entrevista). Centraliza o estado de
 * loading/erro e a chamada fetch, já tratando o erro 503 (IA indisponível)
 * de forma amigável (ver PRD: vocabulário deve continuar funcionando mesmo
 * se a IA cair, e as outras telas devem falhar com mensagem clara).
 */
export function useAIFeedback<TFeedback>({ endpoint }: UseAIFeedbackOptions<TFeedback>) {
  const [feedback, setFeedback] = useState<TFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(body: Record<string, unknown>) {
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Algo deu errado. Tente novamente.");
        return;
      }

      setFeedback(data.feedback);
    } catch {
      setError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return { feedback, isLoading, error, submit, reset: () => setFeedback(null) };
}
