import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PrimaryButton } from "../components/ui";

export function Login() {
  const { session, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao entrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cr-bg px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-cr-border bg-white p-8">
        <div className="text-center">
          <div className="font-display text-2xl font-bold">
            UTI <span className="font-normal text-cr-muted">CEL</span>
          </div>
          <div className="mt-1 text-[12.5px] text-cr-muted">Entre para acessar sua loja</div>
        </div>

        <label className="mt-6 block text-xs font-semibold text-cr-muted">
          E-mail
          <input
            autoFocus
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@sualoja.com.br"
            className="input mt-1"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-cr-muted">
          Senha
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input mt-1"
          />
        </label>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <PrimaryButton type="submit" disabled={submitting} className="mt-5 w-full">
          {submitting ? "Entrando..." : "Entrar"}
        </PrimaryButton>
      </form>
    </div>
  );
}
