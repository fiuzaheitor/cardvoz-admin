"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, logout, restoreSession, type User } from "@/lib/api";

const SessionContext = createContext<{ user: User | null; setUser: (user: User) => void }>({
  user: null,
  setUser: () => {},
});

/** Admin logado (null só na tela de entrar). */
export const useSession = () => useContext(SessionContext);

const LINKS = [
  { href: "/", label: "Painel" },
  { href: "/usuarios/", label: "Usuários" },
  { href: "/baralhos/", label: "Baralhos compartilhados" },
];

/** Cabeçalho e proteção de todas as páginas, exceto /entrar/. */
export function Painel({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const isLogin = pathname.startsWith("/entrar");

  const check = useCallback(() => {
    setError("");
    restoreSession()
      .then((restored) => (restored ? setUser(restored) : router.replace("/entrar/")))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Não foi possível conferir sua sessão."));
  }, [router]);

  useEffect(() => {
    if (!isLogin && !user) check();
  }, [isLogin, user, check]);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.replace("/entrar/");
  };

  let content = children;
  if (!isLogin && error) {
    content = (
      <main id="conteudo">
        <h1>Não foi possível abrir o painel</h1>
        <p role="alert">{error}</p>
        <button type="button" onClick={check}>
          Tentar de novo
        </button>
      </main>
    );
  } else if (!isLogin && !user) {
    content = (
      <main id="conteudo">
        <p role="status">Verificando sua sessão...</p>
      </main>
    );
  }

  return (
    <SessionContext.Provider value={{ user, setUser }}>
      {user && !isLogin && (
        <header className="topo">
          <strong>CardVoz Admin</strong>
          <nav aria-label="Principal">
            <ul>
              {LINKS.map(({ href, label }) => {
                const current = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link href={href} aria-current={current ? "page" : undefined}>
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <span className="quem">{user.name}</span>
          <button type="button" className="secundario" onClick={handleLogout}>
            Sair
          </button>
        </header>
      )}
      {content}
    </SessionContext.Provider>
  );
}
