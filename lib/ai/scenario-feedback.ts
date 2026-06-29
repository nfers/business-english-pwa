import { generateStructuredAIResponse } from "./gemini-client";

export interface ScenarioFeedback {
  corrected_text: string;
  issues: { original: string; suggestion: string; explanation: string }[];
  tone_notes: string;
  score: number; // 0-10
}

/**
 * Avalia a resposta do usuário a um cenário de trabalho simulado
 * (ex: "seu projeto vai atrasar, escreva um update para o cliente").
 */
export async function getScenarioFeedback(
  scenarioPrompt: string,
  userResponse: string
): Promise<ScenarioFeedback> {
  const systemInstruction = `Você é um professor de inglês de negócios para falantes de português brasileiro
de nível intermediário (B1-B2) buscando fluência profissional.

O usuário recebeu este cenário de trabalho: "${scenarioPrompt}"

Avalie a resposta escrita pelo usuário e retorne um JSON com este formato exato:
{
  "corrected_text": "versão corrigida e natural da resposta do usuário, em inglês",
  "issues": [
    { "original": "trecho original com erro", "suggestion": "correção sugerida", "explanation": "explicação curta em português do porquê" }
  ],
  "tone_notes": "comentário em português sobre o tom/formalidade da resposta, considerando o contexto de trabalho",
  "score": 7
}

Seja específico nos erros encontrados. Se a resposta estiver muito boa, "issues" pode ser uma lista vazia.
O score vai de 0 a 10, considerando gramática, vocabulário, clareza e adequação ao contexto profissional.`;

  return generateStructuredAIResponse<ScenarioFeedback>({
    systemInstruction,
    userContent: userResponse,
  });
}
