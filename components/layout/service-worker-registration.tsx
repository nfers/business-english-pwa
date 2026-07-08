"use client";

import { useEffect } from "react";

/**
 * Registra o service worker no carregamento do app.
 * Componente "invisível" — não renderiza nada, só executa o efeito.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Em dev, o cache-first do SW serve chunks obsoletos a cada rebuild,
      // o que dispara reload automático do Next e entra em loop infinito.
      // Remove qualquer registro/cache de sessões de dev anteriores.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Falha ao registrar o service worker:", error);
    });
  }, []);

  return null;
}
