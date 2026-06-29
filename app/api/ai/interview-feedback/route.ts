import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getInterviewFeedback } from "@/lib/ai/interview-feedback";
import { AIProviderError } from "@/lib/ai/gemini-client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { questionId, questionText, responseText, responseMode } = await request.json();

  if (!questionId || !questionText || !responseText) {
    return NextResponse.json(
      { error: "Campos obrigatórios: questionId, questionText, responseText." },
      { status: 400 }
    );
  }

  try {
    const feedback = await getInterviewFeedback(questionText, responseText);

    const { error: insertError } = await supabase.from("interview_attempts").insert({
      user_id: user.id,
      question_id: questionId,
      response_text: responseText,
      response_mode: responseMode === "voice" ? "voice" : "text",
      ai_feedback: feedback,
    });

    if (insertError) {
      console.error("Erro ao salvar tentativa de entrevista:", insertError);
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { error: "Não foi possível obter feedback da IA agora. Tente novamente em alguns segundos." },
        { status: 503 }
      );
    }
    console.error("Erro inesperado em interview-feedback:", error);
    return NextResponse.json({ error: "Erro inesperado." }, { status: 500 });
  }
}
