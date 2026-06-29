import { generateStructuredAIResponse } from "./gemini-client";

export interface EmailCorrectionFeedback {
  corrected_text: string;
  issues: { original: string; suggestion: string; type: "grammar" | "style" | "tone"; explanation: string }[];
  style_notes: string;
}

/**
 * Corrige um rascunho de email/texto de trabalho, separando erros
 * gramaticais de sugestões de estilo/tom.
 */
export async function getEmailCorrection(
  originalText: string
): Promise<EmailCorrectionFeedback> {
  const systemInstruction = `Você é um revisor de inglês de negócios para falantes de português brasileiro
de nível intermediário (B1-B2) que precisam escrever emails profissionais.

Corrija o texto enviado pelo usuário e retorne um JSON com este formato exato:
{
  "corrected_text": "versão corrigida e profissional do texto, em inglês",
  "issues": [
    { "original": "trecho original", "suggestion": "correção sugerida", "type": "grammar", "explanation": "explicação curta em português" }
  ],
  "style_notes": "comentário em português sobre o tom geral do email e sugestões de formalidade, se aplicável"
}

O campo "type" de cada issue deve ser "grammar" (erro gramatical), "style" (estilo de escrita) ou "tone" (formalidade/tom).
Seja específico e didático nas explicações.`;

  return generateStructuredAIResponse<EmailCorrectionFeedback>({
    systemInstruction,
    userContent: originalText,
  });
}
