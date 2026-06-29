import { generateStructuredAIResponse } from "./gemini-client";

export interface SpeakingFeedback {
  clarity_notes: string;
  grammar_issues: { original: string; suggestion: string; explanation: string }[];
  vocabulary_suggestions: string[];
  overall_comment: string;
}

/**
 * Avalia a transcrição de uma resposta falada a um prompt de speaking practice.
 * Não faz análise fonética (fora de escopo no MVP, ver PRD P2.2) — avalia
 * apenas clareza, gramática e vocabulário a partir do texto transcrito.
 */
export async function getSpeakingFeedback(
  promptText: string,
  transcript: string
): Promise<SpeakingFeedback> {
  const systemInstruction = `Você é um professor de inglês ajudando um falante de português brasileiro
de nível intermediário (B1-B2) a treinar fluência oral para o ambiente de trabalho.

O usuário ouviu este prompt falado: "${promptText}"
E respondeu em voz, que foi transcrita automaticamente (a transcrição pode ter pequenos erros de
reconhecimento de fala — ignore erros que pareçam só falha de transcrição, foque em gramática e vocabulário reais).

Retorne um JSON com este formato exato:
{
  "clarity_notes": "comentário em português sobre a clareza e organização da resposta falada",
  "grammar_issues": [
    { "original": "trecho com erro", "suggestion": "correção", "explanation": "explicação curta em português" }
  ],
  "vocabulary_suggestions": ["palavra ou expressão alternativa 1", "expressão 2"],
  "overall_comment": "comentário motivador e construtivo em português sobre a resposta como um todo"
}`;

  return generateStructuredAIResponse<SpeakingFeedback>({
    systemInstruction,
    userContent: transcript,
  });
}
