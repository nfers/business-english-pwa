"use client";

import { useEffect } from "react";

/**
 * Registra o service worker no carregamento do app.
 * Componente "invisível" — não renderiza nada, só executa o efeito.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Falha ao registrar o service worker:", error);
      });
    }
  }, []);

  return null;
}
