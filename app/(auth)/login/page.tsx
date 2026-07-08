"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [devEmail, setDevEmail] = useState("dev@fluencydesk.test");
  const [devPassword, setDevPassword] = useState("");
  const [devStatus, setDevStatus] = useState<"idle" | "loading" | "error">("idle");
  const [devMessage, setDevMessage] = useState("");

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

  async function handleDevSignIn(event: React.FormEvent) {
    event.preventDefault();
    setDevStatus("loading");
    setDevMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: devEmail, password: devPassword });

    if (error) {
      setDevStatus("error");
      setDevMessage(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleDevSignUp(event: React.MouseEvent) {
    event.preventDefault();
    setDevStatus("loading");
    setDevMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email: devEmail, password: devPassword });

    if (error) {
      setDevStatus("error");
      setDevMessage(error.message);
      return;
    }

    setDevStatus("idle");
    setDevMessage("Conta criada. Clique em Entrar para continuar.");
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

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-8 rounded-lg border border-dashed border-[var(--color-border)] p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">
              Login com senha (dev only)
            </p>
            <form onSubmit={handleDevSignIn} className="flex flex-col gap-2">
              <input
                type="email"
                required
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                placeholder="dev@fluencydesk.test"
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />
              <input
                type="password"
                required
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                placeholder="Senha"
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              />

              {devMessage && (
                <p className={`text-xs ${devStatus === "error" ? "text-[var(--color-warn)]" : "text-[var(--color-fg-muted)]"}`}>
                  {devMessage}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={devStatus === "loading" || !devEmail || !devPassword}
                  className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={handleDevSignUp}
                  disabled={devStatus === "loading" || !devEmail || !devPassword}
                  className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium disabled:opacity-60"
                >
                  Criar conta
                </button>
              </div>
            </form>
            <p className="mt-2 text-xs text-[var(--color-fg-muted)]">
              Requer &quot;Confirm email&quot; desativado no Supabase (Authentication → Sign In / Providers → Email), senão o cadastro também dispara email e cai no mesmo rate limit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
