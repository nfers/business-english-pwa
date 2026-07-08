"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  async function handleSetPassword(event: React.FormEvent) {
    event.preventDefault();

    if (password.length < 8) {
      setStatus("error");
      setMessage("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("As senhas não conferem.");
      return;
    }

    setStatus("saving");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("saved");
    setMessage("Senha salva. No próximo acesso você pode entrar direto com email e senha.");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  const inputClass =
    "rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[var(--color-fg-muted)] mb-1">Ajustes</p>
        <h1 className="font-display text-2xl font-semibold">Sua conta</h1>
        {email && (
          <p className="text-sm text-[var(--color-fg-muted)] mt-2">
            Conectado como <strong>{email}</strong>
          </p>
        )}
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-1">Senha de acesso</h2>
        <p className="text-sm text-[var(--color-fg-muted)] mb-4">
          Defina uma senha para entrar direto, sem precisar do link por email.
        </p>

        <form onSubmit={handleSetPassword} className="flex flex-col gap-3">
          <label htmlFor="new-password" className="text-sm font-medium">
            Nova senha
          </label>
          <input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className={inputClass}
          />

          <label htmlFor="confirm-password" className="text-sm font-medium">
            Confirmar senha
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a senha"
            className={inputClass}
          />

          {status === "error" && (
            <p className="text-sm text-[var(--color-warn)]">{message}</p>
          )}
          {status === "saved" && (
            <p className="text-sm text-[var(--color-good)]">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="mt-2 self-start rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
          >
            {status === "saving" ? "Salvando..." : "Salvar senha"}
          </button>
        </form>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-1">Sessão</h2>
        <p className="text-sm text-[var(--color-fg-muted)] mb-4">
          Sair da sua conta neste dispositivo.
        </p>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-[var(--color-warn)] px-4 py-2.5 text-sm font-medium text-[var(--color-warn)] transition-opacity hover:opacity-80"
        >
          Sair
        </button>
      </Card>
    </div>
  );
}
