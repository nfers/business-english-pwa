import { generateStructuredAIResponse } from "./gemini-client";

export interface InterviewFeedback {
  clarity_notes: string;
  structure_notes: string;
  grammar_issues: { original: string; suggestion: string; explanation: string }[];
  overall_comment: string;
}

/**
 * Avalia a resposta do usuário a uma pergunta de entrevista técnica
 * (ex: explicar um projeto, justificar decisão de arquitetura, trade-offs).
 * Considera estrutura da resposta (ex: aderência a algo como o método STAR
 * quando aplicável) além de gramática e clareza.
 */
export async function getInterviewFeedback(
  questionText: string,
  responseText: string
): Promise<InterviewFeedback> {
  const systemInstruction = `Você é um entrevistador técnico experiente ajudando um candidato falante de
português brasileiro (nível B1-B2 de inglês) a treinar respostas em inglês para entrevistas técnicas
de tecnologia/produto.

A pergunta de entrevista foi: "${questionText}"

Avalie a resposta do candidato e retorne um JSON com este formato exato:
{
  "clarity_notes": "comentário em português sobre quão clara e compreensível foi a explicação técnica",
  "structure_notes": "comentário em português sobre a estrutura da resposta (ex: se seguiu uma lógica de contexto-ação-resultado, se foi direto ao ponto, se faltou estrutura)",
  "grammar_issues": [
    { "original": "trecho com erro", "suggestion": "correção", "explanation": "explicação curta em português" }
  ],
  "overall_comment": "comentário construtivo em português, como um entrevistador real daria, considerando o que funcionou bem e o que melhorar"
}

Avalie como um entrevistador real avaliaria: clareza técnica importa tanto quanto a gramática.`;

  return generateStructuredAIResponse<InterviewFeedback>({
    systemInstruction,
    userContent: responseText,
  });
}
