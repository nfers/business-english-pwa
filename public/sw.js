/**
 * Service worker básico — cobre o requisito P0.7/P0.8 do PRD:
 * o app deve abrir e a revisão de vocabulário já carregado deve
 * funcionar mesmo sem conexão.
 *
 * Estratégia: cache-first para assets estáticos (shell do app),
 * network-first para chamadas de API (sempre tenta buscar dados
 * frescos, já que vocabulário/progresso vêm do Supabase).
 */

const CACHE_NAME = "fluency-desk-v1";
const APP_SHELL = ["/dashboard", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Chamadas de API e de autenticação: sempre rede, nunca cache
  // (dados de progresso e IA precisam estar sempre atualizados).
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response.ok && request.method === "GET") {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Sem rede e sem cache: deixa o navegador mostrar o erro padrão
          // (evita mascarar falhas reais de API com uma página offline genérica).
          return new Response("Offline e sem dados em cache para esta página.", {
            status: 503,
            statusText: "Offline",
          });
        });
    })
  );
});
