"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook de leitura em voz alta (texto → fala) via SpeechSynthesis API,
 * nativa do navegador — mesma decisão de custo zero do use-voice-recording.
 * Prioriza uma voz en-US quando disponível.
 */
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  // Sem esta referência, o Chrome pode coletar a utterance no meio da fala
  // e o onend nunca dispara.
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, options?: { rate?: number }) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = options?.rate ?? 1;

    const voices = synth.getVoices();
    const englishVoice =
      voices.find((v) => v.lang === "en-US") ?? voices.find((v) => v.lang.startsWith("en"));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    synth.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isSupported };
}
