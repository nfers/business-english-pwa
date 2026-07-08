"use client";

import { Volume2, Square } from "lucide-react";
import { useTTS } from "@/lib/speech/use-tts";

interface AudioButtonProps {
  /** Texto em inglês a ser lido em voz alta */
  text: string;
  /** Velocidade da fala (1 = normal, 0.75 = devagar) */
  rate?: number;
  /** Rótulo acessível e opcionalmente visível ao lado do ícone */
  label?: string;
  className?: string;
}

/**
 * Botão de ouvir pronúncia. Alterna entre tocar e parar.
 * Não renderiza nada se o navegador não suportar síntese de voz.
 */
export function AudioButton({ text, rate, label, className }: AudioButtonProps) {
  const { speak, stop, isSpeaking, isSupported } = useTTS();

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={() => (isSpeaking ? stop() : speak(text, { rate }))}
      className={[
        "inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-accent)] transition-colors hover:border-[var(--color-accent)]",
        className ?? "",
      ].join(" ")}
      aria-label={isSpeaking ? "Parar áudio" : (label ?? "Ouvir em inglês")}
    >
      {isSpeaking ? <Square size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
      {label && <span>{label}</span>}
    </button>
  );
}
