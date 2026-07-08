import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateListeningExercise } from "@/lib/ai/listening-exercise";
import { AIProviderError } from "@/lib/ai/gemini-client";

const ALLOWED_LEVELS = new Set(["A2", "B1", "B2", "C1"]);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { level, topic } = await request.json();

  if (!ALLOWED_LEVELS.has(level) || typeof topic !== "string" || topic.length > 120) {
    return NextResponse.json(
      { error: "Campos obrigatórios: level (A2-C1) e topic." },
      { status: 400 }
    );
  }

  try {
    const exercise = await generateListeningExercise(level, topic);
    return NextResponse.json({ feedback: exercise });
  } catch (error) {
    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { error: "Não foi possível gerar o exercício agora. Tente novamente em alguns segundos." },
        { status: 503 }
      );
    }
    console.error("Erro inesperado em listening-exercise:", error);
    return NextResponse.json({ error: "Erro inesperado." }, { status: 500 });
  }
}
