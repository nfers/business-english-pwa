import { createClient } from "@/lib/supabase/server";
import { CefrProgressBar } from "@/components/layout/cefr-progress-bar";
import { Card } from "@/components/ui/card";
import { Flame, BookOpenText, MessagesSquare, Mic } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: activity } = await supabase
    .from("daily_activity")
    .select("*")
    .eq("user_id", user?.id)
    .order("activity_date", { ascending: false })
    .limit(7);

  const todayActivity = activity?.[0];
  const streak = calculateStreak(activity ?? []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-[var(--color-fg-muted)] mb-1">Bem-vindo de volta</p>
        <h1 className="font-display text-2xl font-semibold">Seu painel de progresso</h1>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-[var(--color-fg-muted)]">
            Nível estimado (CEFR)
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-warn)]">
            <Flame size={16} aria-hidden="true" />
            {streak} {streak === 1 ? "dia" : "dias"} de sequência
          </span>
        </div>
        {/* Nível inicial fixo em B1 até termos um cálculo real baseado em desempenho */}
        <CefrProgressBar currentLevel="B1" />
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={BookOpenText}
          label="Cards revisados hoje"
          value={todayActivity?.vocabulary_reviews ?? 0}
        />
        <StatCard
          icon={MessagesSquare}
          label="Cenários hoje"
          value={todayActivity?.scenarios_completed ?? 0}
        />
        <StatCard
          icon={Mic}
          label="Speaking hoje"
          value={todayActivity?.speaking_attempts ?? 0}
        />
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-1">Por onde começar?</h2>
        <p className="text-sm text-[var(--color-fg-muted)]">
          Use o menu para revisar vocabulário, treinar um cenário de trabalho, corrigir um
          email ou praticar uma resposta de entrevista técnica.
        </p>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpenText;
  label: string;
  value: number;
}) {
  return (
    <Card className="flex flex-col items-center gap-1 p-4 text-center">
      <Icon size={18} className="text-[var(--color-accent)] mb-1" aria-hidden="true" />
      <span className="font-display text-xl font-semibold">{value}</span>
      <span className="text-[11px] leading-tight text-[var(--color-fg-muted)]">{label}</span>
    </Card>
  );
}

/** Conta dias consecutivos (a partir de hoje) com pelo menos uma atividade registrada. */
function calculateStreak(activity: { activity_date: string }[]): number {
  if (activity.length === 0) return 0;

  const dates = new Set(activity.map((a) => a.activity_date));
  let streak = 0;
  const cursor = new Date();

  while (dates.has(cursor.toISOString().split("T")[0])) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
