"use client";

import { useRef, useState } from "react";

// Tipos mínimos da Web Speech API — não inclusos no lib.dom.d.ts padrão do TS.
interface SpeechRecognitionResultEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } } & { length: number };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
};

/**
 * Hook de gravação de voz com transcrição via Web Speech API (gratuita,
 * nativa do navegador — decisão registrada no PRD em favor do custo zero,
 * mesmo com suporte inconsistente entre browsers/mobile).
 */
export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  function startRecording() {
    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognitionClass = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    setTranscript("");
    setIsSupported(true);

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let fullTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      setTranscript(fullTranscript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  function resetTranscript() {
    setTranscript("");
  }

  return { isRecording, transcript, isSupported, startRecording, stopRecording, resetTranscript };
}
