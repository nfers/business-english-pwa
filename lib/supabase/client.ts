import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em Client Components.
 * Usa as variáveis públicas (anon key), seguras para expor no browser
 * porque o acesso aos dados é protegido por Row Level Security (ver
 * supabase/migrations/0001_init.sql).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
