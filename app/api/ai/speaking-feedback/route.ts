import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSpeakingFeedback } from "@/lib/ai/speaking-feedback";
import { AIProviderError } from "@/lib/ai/gemini-client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { promptId, promptText, transcript } = await request.json();

  if (!promptId || !promptText || !transcript) {
    return NextResponse.json(
      { error: "Campos obrigatórios: promptId, promptText, transcript." },
      { status: 400 }
    );
  }

  try {
    const feedback = await getSpeakingFeedback(promptText, transcript);

    const { error: insertError } = await supabase.from("speaking_attempts").insert({
      user_id: user.id,
      prompt_id: promptId,
      transcript,
      ai_feedback: feedback,
    });

    if (insertError) {
      console.error("Erro ao salvar tentativa de speaking:", insertError);
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { error: "Não foi possível obter feedback da IA agora. Tente novamente em alguns segundos." },
        { status: 503 }
      );
    }
    console.error("Erro inesperado em speaking-feedback:", error);
    return NextResponse.json({ error: "Erro inesperado." }, { status: 500 });
  }
}
