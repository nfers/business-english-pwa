"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "password" | "magic";
type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // O callback de auth redireciona para cá com ?error=... quando o link expira.
  const callbackError = searchParams.get("error")
    ? "O link de acesso expirou ou já foi usado. Peça um novo link."
    : "";
  const errorMessage = status === "error" ? message : status === "idle" ? callbackError : "";

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setMessage("");
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus("error");
      setMessage(
        "Email ou senha incorretos. Se você ainda não definiu uma senha, entre com o link por email e defina uma em Ajustes."
      );
      return;
    }

    // Navegação completa para o servidor enxergar os cookies da nova sessão.
    window.location.assign("/dashboard");
  }

  async function handleMagicLinkSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  async function handleForgotPassword() {
    if (!email) {
      setStatus("error");
      setMessage("Preencha seu email primeiro para receber o link de redefinição.");
      return;
    }

    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/settings")}`,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage(
      "Enviamos um link de redefinição de senha. Abra seu email, clique no link e defina a nova senha em Ajustes."
    );
  }

  // Atalho de dev: cria uma conta de teste com email+senha sem depender de
  // entrega de email. Nunca aparece em produção.
  async function handleDevSignUp() {
    if (!email || !password) {
      setStatus("error");
      setMessage("Preencha email e senha para criar a conta de teste.");
      return;
    }

    setStatus("sending");
    setMessage("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    if (data.session) {
      window.location.assign("/dashboard");
      return;
    }

    setStatus("sent");
    setMessage("Conta criada. Confirme o email ou entre com email e senha.");
  }

  const inputClass =
    "rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold mb-2">Fluency Desk</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mb-6">
          Treino diário de inglês para o trabalho.
        </p>

        <div className="mb-6 grid grid-cols-2 rounded-lg border border-[var(--color-border)] p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => switchMode("password")}
            className={[
              "rounded-md py-2 transition-colors",
              mode === "password"
                ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg)]"
                : "text-[var(--color-fg-muted)]",
            ].join(" ")}
          >
            Email e senha
          </button>
          <button
            type="button"
            onClick={() => switchMode("magic")}
            className={[
              "rounded-md py-2 transition-colors",
              mode === "magic"
                ? "bg-[var(--color-bg-elevated)] text-[var(--color-fg)]"
                : "text-[var(--color-fg-muted)]",
            ].join(" ")}
          >
            Link por email
          </button>
        </div>

        {status === "sent" ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 text-sm">
            {message || (
              <>
                Enviamos um link de acesso para <strong>{email}</strong>. Abra seu email e
                clique no link para entrar.
              </>
            )}
          </div>
        ) : (
          <form
            onSubmit={mode === "password" ? handlePasswordSubmit : handleMagicLinkSubmit}
            className="flex flex-col gap-3"
          >
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
              className={inputClass}
            />

            {mode === "password" && (
              <>
                <label htmlFor="password" className="text-sm font-medium">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className={inputClass}
                />
              </>
            )}

            {errorMessage && (
              <p className="text-sm text-[var(--color-warn)]">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-2 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            >
              {status === "sending"
                ? "Aguarde..."
                : mode === "password"
                  ? "Entrar"
                  : "Enviar link de acesso"}
            </button>

            {mode === "password" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={status === "sending"}
                className="text-sm text-[var(--color-fg-muted)] underline underline-offset-4 hover:text-[var(--color-fg)] disabled:opacity-60"
              >
                Esqueci ou ainda não tenho senha
              </button>
            )}

            {mode === "password" && process.env.NODE_ENV !== "production" && (
              <button
                type="button"
                onClick={handleDevSignUp}
                disabled={status === "sending"}
                className="rounded-lg border border-dashed border-[var(--color-border)] py-2 text-xs font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] disabled:opacity-60"
              >
                Criar conta de teste (dev only)
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
