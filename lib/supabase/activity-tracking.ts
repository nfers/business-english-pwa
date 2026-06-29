import { createClient } from "@/lib/supabase/client";

type ActivityField =
  | "vocabulary_reviews"
  | "scenarios_completed"
  | "emails_corrected"
  | "speaking_attempts"
  | "interview_attempts";

/**
 * Incrementa em 1 o contador de atividade do dia (ver tabela daily_activity).
 * Usado por todas as features para alimentar o streak e o dashboard.
 */
export async function incrementDailyActivity(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  field: ActivityField
) {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("daily_activity")
    .select(`id, ${field}`)
    .eq("user_id", userId)
    .eq("activity_date", today)
    .maybeSingle();

  if (existing) {
    const currentValue = (existing as unknown as Record<string, number>)[field] ?? 0;
    await supabase
      .from("daily_activity")
      .update({ [field]: currentValue + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("daily_activity").insert({
      user_id: userId,
      activity_date: today,
      [field]: 1,
    });
  }
}
