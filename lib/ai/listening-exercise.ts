import { generateStructuredAIResponse } from "./gemini-client";

export interface ListeningExercise {
  /** Trecho em inglês que será lido em voz alta (nunca mostrado antes da resposta) */
  audio_text: string;
  /** Pergunta de compreensão, em inglês */
  question: string;
  /** Exatamente 3 alternativas, uma correta */
  options: string[];
  /** Índice (0-2) da alternativa correta */
  correct_index: number;
  /** Explicação curta em português */
  explanation_pt: string;
}

const SYSTEM_INSTRUCTION = `Você cria exercícios de listening de inglês de negócios para uma profissional brasileira de tecnologia.

Gere um trecho falado curto (2 a 4 frases, inglês natural de trabalho: reuniões, standups, feedback, prazos, clientes) e UMA pergunta de compreensão sobre ele com exatamente 3 alternativas, sendo apenas uma correta. As alternativas erradas devem ser plausíveis (mesmo tema), mas claramente incorretas para quem entendeu o áudio.

Responda neste formato JSON:
{
  "audio_text": "trecho em inglês que será lido em voz alta",
  "question": "pergunta de compreensão em inglês",
  "options": ["alternativa A", "alternativa B", "alternativa C"],
  "correct_index": 0,
  "explanation_pt": "explicação curta em português de por que essa é a resposta"
}`;

export async function generateListeningExercise(
  level: string,
  topic: string
): Promise<ListeningExercise> {
  const exercise = await generateStructuredAIResponse<ListeningExercise>({
    systemInstruction: SYSTEM_INSTRUCTION,
    userContent: `Nível CEFR: ${level}. Tema do trecho: ${topic}. Gere um exercício novo.`,
  });

  // Validação defensiva: a IA às vezes foge do formato.
  if (
    typeof exercise.audio_text !== "string" ||
    typeof exercise.question !== "string" ||
    !Array.isArray(exercise.options) ||
    exercise.options.length < 2 ||
    typeof exercise.correct_index !== "number" ||
    exercise.correct_index < 0 ||
    exercise.correct_index >= exercise.options.length
  ) {
    throw new Error("Exercício gerado em formato inválido.");
  }

  return exercise;
}
