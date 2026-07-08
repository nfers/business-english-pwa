/**
 * Configuração pública do Supabase.
 *
 * A URL e a publishable key são públicas por design: elas já são embutidas
 * no bundle do browser e o acesso aos dados é protegido por Row Level
 * Security (ver supabase/migrations/0001_init.sql). Manter os valores aqui
 * garante que o app funcione mesmo sem variáveis de ambiente configuradas
 * na Vercel; as variáveis, quando presentes, têm precedência (útil para
 * apontar para outro projeto em preview/local).
 *
 * Segredos de verdade (service role key, senha do banco, JWT secret) NUNCA
 * devem entrar neste arquivo nem em variáveis NEXT_PUBLIC_*.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hzehpvbazwcpfhogsoxm.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_sFIKZfHJCcXMYUupkooT7g_aghcECzB";
