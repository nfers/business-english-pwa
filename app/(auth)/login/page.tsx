"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold mb-2">Fluency Desk</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mb-8">
          Treino diário de inglês para o trabalho. Entre com seu email para continuar.
        </p>

        {status === "sent" ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 text-sm">
            Enviamos um link de acesso para <strong>{email}</strong>. Abra seu email e clique no link para entrar.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
            />

            {status === "error" && (
              <p className="text-sm text-[var(--color-warn)]">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            >
              {status === "sending" ? "Enviando..." : "Enviar link de acesso"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
