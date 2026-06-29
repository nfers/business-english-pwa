import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEmailCorrection } from "@/lib/ai/email-correction";
import { AIProviderError } from "@/lib/ai/gemini-client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { originalText } = await request.json();

  if (!originalText || typeof originalText !== "string" || originalText.trim().length === 0) {
    return NextResponse.json(
      { error: "Campo obrigatório: originalText." },
      { status: 400 }
    );
  }

  try {
    const feedback = await getEmailCorrection(originalText);

    const { error: insertError } = await supabase.from("email_corrections").insert({
      user_id: user.id,
      original_text: originalText,
      ai_feedback: feedback,
    });

    if (insertError) {
      console.error("Erro ao salvar correção de email:", insertError);
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof AIProviderError) {
      return NextResponse.json(
        { error: "Não foi possível obter a correção agora. Tente novamente em alguns segundos." },
        { status: 503 }
      );
    }
    console.error("Erro inesperado em email-correction:", error);
    return NextResponse.json({ error: "Erro inesperado." }, { status: 500 });
  }
}
