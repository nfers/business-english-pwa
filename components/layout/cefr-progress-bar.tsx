const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof LEVELS)[number];

interface CefrProgressBarProps {
  /** Nível atual estimado do usuário, baseado no desempenho real */
  currentLevel: CefrLevel;
  className?: string;
}

/**
 * Barra de progressão A1 → C2. É o elemento assinatura do produto: a
 * jornada do usuário é literalmente "subir" nesse eixo, então ele fica
 * sempre visível como orientação central — não como decoração.
 */
export function CefrProgressBar({ currentLevel, className = "" }: CefrProgressBarProps) {
  const currentIndex = LEVELS.indexOf(currentLevel);

  return (
    <div className={`w-full ${className}`} role="img" aria-label={`Nível atual: ${currentLevel}`}>
      <div className="flex items-center gap-1.5">
        {LEVELS.map((level, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={level} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={[
                  "h-1.5 w-full rounded-full transition-colors",
                  isPast || isCurrent ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]",
                ].join(" ")}
              />
              <span
                className={[
                  "text-xs font-medium tracking-wide",
                  isCurrent
                    ? "text-[var(--color-fg)]"
                    : isFuture
                      ? "text-[var(--color-fg-muted)]"
                      : "text-[var(--color-fg-muted)]",
                ].join(" ")}
              >
                {level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
