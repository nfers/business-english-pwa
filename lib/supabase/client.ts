import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config";

/**
 * Cliente Supabase para uso em Client Components.
 * Usa as credenciais públicas (publishable key), seguras para expor no
 * browser porque o acesso aos dados é protegido por Row Level Security
 * (ver supabase/migrations/0001_init.sql).
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
