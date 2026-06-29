import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getScenarioFeedback } from "@/lib/ai/scenario-feedback";
import { AIProviderError } from "@/lib/ai/gemini-client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { scenarioId, scenarioPrompt, userResponse } = await request.json();

  if (!scenarioId || !scenarioPrompt || !userResponse) {
    return NextResponse.json(
      { error: "Campos obrigatórios: scenarioId, scenarioPrompt, userResponse." },
      { status: 400 }
    );
  }

  try {
    const feedback = await getScenarioFeedback(scenarioPrompt, userResponse);

    const { error: insertError } = await supabase.from("scenario_attempts").insert({
      user_id: user.id,
      scenario_id: scenarioId,
      user_response: userResponse,
      ai_feedback: feedback,
    });

    if (insertError) {
      console.error("Erro ao salvar tentativa de cenário:", insertError);
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { error: "Não foi possível obter feedback da IA agora. Tente novamente em alguns segundos." },
        { status: 503 }
      );
    }
    console.error("Erro inesperado em scenario-feedback:", error);
    return NextResponse.json({ error: "Erro inesperado." }, { status: 500 });
  }
}
