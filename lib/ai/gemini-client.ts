/**
 * Cliente de IA isolado — hoje usa Google Gemini (free tier).
 *
 * Por que isolar: o PRD prevê (P2.3) trocar de provider no futuro sem
 * reescrever a aplicação. Toda chamada de IA do app deve passar por aqui,
 * nunca chamar a API do Gemini diretamente em outro lugar do código.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export class AIProviderError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AIProviderError";
  }
}

interface GenerateOptions {
  /** Instrução de sistema (define o papel do modelo na tarefa) */
  systemInstruction: string;
  /** Conteúdo enviado pelo usuário (texto, transcrição, etc.) */
  userContent: string;
  /** Se true, instrui o modelo a responder em JSON puro (sem markdown) */
  expectJson?: boolean;
}

/**
 * Chama o Gemini e retorna o texto da resposta.
 * Lança AIProviderError em caso de falha de rede, chave ausente, ou resposta vazia.
 */
export async function generateAIResponse({
  systemInstruction,
  userContent,
  expectJson = false,
}: GenerateOptions): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new AIProviderError(
      "GEMINI_API_KEY não configurada. Defina a variável de ambiente no .env.local."
    );
  }

  const finalSystemInstruction = expectJson
    ? `${systemInstruction}\n\nResponda APENAS com um JSON válido, sem markdown, sem crases, sem texto antes ou depois.`
    : systemInstruction;

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: finalSystemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userContent }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new AIProviderError(
        `Gemini API retornou erro ${response.status}: ${errorBody}`
      );
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new AIProviderError("Gemini API retornou resposta vazia ou em formato inesperado.");
    }

    return text;
  } catch (error) {
    if (error instanceof AIProviderError) throw error;
    throw new AIProviderError("Falha ao chamar a API do Gemini.", error);
  }
}

/**
 * Helper para quando esperamos um JSON estruturado de volta.
 * Remove possíveis cercas de markdown (```json ... ```) antes de fazer o parse.
 */
export async function generateStructuredAIResponse<T>(
  options: GenerateOptions
): Promise<T> {
  const raw = await generateAIResponse({ ...options, expectJson: true });
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new AIProviderError(
      "Não foi possível interpretar a resposta da IA como JSON.",
      error
    );
  }
}
