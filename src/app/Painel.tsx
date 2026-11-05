"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, logout, restoreSession, type User } from "@/lib/api";
import { Logo } from "./Logo";

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

/** Menu lateral e proteção de todas as páginas, exceto /entrar/. No celular, o menu abre pelo botão "Menu". */
export function Painel({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const isLogin = pathname.startsWith("/entrar");
  const [menuAberto, setMenuAberto] = useState(false);
  const menuBotaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const check = useCallback(() => {
    setError("");
    restoreSession()
      .then((restored) => (restored ? setUser(restored) : router.replace("/entrar/")))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Não foi possível conferir sua sessão."));
  }, [router]);

  useEffect(() => {
    if (!isLogin && !user) check();
  }, [isLogin, user, check]);

  // Fecha ao trocar de página
  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuAberto) return;
    // Ao abrir, o foco vai para o primeiro link do menu
    menuRef.current?.querySelector<HTMLElement>("nav a")?.focus();
    const fecharComEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuAberto(false);
        menuBotaoRef.current?.focus();
      }
    };
    // Se a tela crescer até o menu fixo, o conteúdo não pode ficar travado pelo inert
    const largura = window.matchMedia("(min-width: 960px)");
    const fecharSeLargo = () => largura.matches && setMenuAberto(false);
    document.addEventListener("keydown", fecharComEsc);
    largura.addEventListener("change", fecharSeLargo);
    return () => {
      document.removeEventListener("keydown", fecharComEsc);
      largura.removeEventListener("change", fecharSeLargo);
    };
  }, [menuAberto]);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.replace("/entrar/");
  };

  let content = children;
  if (!isLogin && error) {
    content = (
      <main id="conteudo" className="estreito">
        <Logo tamanho={56} />
        <h1>Não foi possível abrir o painel</h1>
        <p role="alert" className="erro">
          {error}
        </p>
        <div className="acoes">
          <button type="button" onClick={check}>
            Tentar de novo
          </button>
        </div>
      </main>
    );
  } else if (!isLogin && !user) {
    content = (
      <main id="conteudo" className="estreito">
        <Logo tamanho={56} />
        <p role="status" className="suave">
          Verificando sua sessão...
        </p>
      </main>
    );
  }

  if (!user || isLogin) {
    return <SessionContext.Provider value={{ user, setUser }}>{content}</SessionContext.Provider>;
  }

  return (
    <SessionContext.Provider value={{ user, setUser }}>
      <div className="app">
        {/* Só no celular: marca e botão que abre o menu */}
        <header className="barra-topo">
          <Link href="/" className="marca">
            <Logo tamanho={36} />
            <span>CardVoz</span>
            <span className="selo selo-admin">Admin</span>
          </Link>
          <button
            ref={menuBotaoRef}
            type="button"
            className="secundario botao-menu"
            aria-expanded={menuAberto}
            aria-controls="menu-lateral"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {menuAberto ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              )}
            </svg>
            {menuAberto ? "Fechar" : "Menu"}
          </button>
        </header>

        <div id="menu-lateral" ref={menuRef} className={`lateral${menuAberto ? " aberta" : ""}`}>
          <Link href="/" className="marca lateral-marca">
            <Logo tamanho={40} />
            <span>CardVoz</span>
            <span className="selo selo-admin">Admin</span>
          </Link>
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
          <div className="lateral-conta">
            <p>
              <span className="lateral-nome">{user.name}</span>
              <span className="lateral-email">{user.email}</span>
            </p>
            <button type="button" className="secundario" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
        {menuAberto && <div className="fundo-menu" aria-hidden="true" onClick={() => setMenuAberto(false)} />}

        {/* Com o menu aberto no celular, o resto da página fica fora do alcance do teclado e do leitor de tela */}
        <div className="conteudo" inert={menuAberto || undefined}>
          {content}
        </div>
      </div>
    </SessionContext.Provider>
  );
}
