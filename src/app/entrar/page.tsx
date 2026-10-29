"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, login, restoreSession } from "@/lib/api";
import { useSession } from "../Painel";

export default function EntrarPage() {
  const router = useRouter();
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Já tem sessão de admin neste navegador: vai direto ao painel
  useEffect(() => {
    restoreSession()
      .then((user) => {
        if (user) {
          setUser(user);
          router.replace("/");
        }
      })
      .catch(() => {});
  }, [router, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (!email.trim() || !password) {
      setError("Escreva seu e-mail e sua senha.");
      emailRef.current?.focus();
      return;
    }
    setSending(true);
    setError("");
    try {
      setUser(await login(email.trim(), password));
      router.replace("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente de novo.");
      setSending(false);
    }
  };

  return (
    <main id="conteudo" className="estreito">
      <h1>CardVoz Admin</h1>
      <p className="suave">
        Entre com o e-mail e a senha da sua conta do CardVoz. Só contas de admin têm acesso.
      </p>
      {error && <p role="alert" className="erro">{error}</p>}
      <form onSubmit={handleSubmit} noValidate className="cartao">
        <label>
          E-mail
          <input
            ref={emailRef}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" aria-disabled={sending || undefined}>
          {sending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
