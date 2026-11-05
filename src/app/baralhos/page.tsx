"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ApiError, deleteSharedDeck, formatDate, getSharedDecks, type Deck } from "@/lib/api";
import { lerAviso } from "@/lib/aviso";
import { useConfirmar } from "../Confirmar";

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export default function BaralhosPage() {
  const [decks, setDecks] = useState<Deck[] | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const [confirmar, dialogo] = useConfirmar();

  const load = useCallback(() => {
    setError("");
    getSharedDecks()
      .then(setDecks)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Não foi possível carregar os baralhos."));
  }, []);

  useEffect(() => {
    load();
    // "“Biologia” salvo." vindo do editor
    const aviso = lerAviso();
    if (aviso) setStatus(aviso);
  }, [load]);

  const remove = async (deck: Deck) => {
    const ok = await confirmar({
      titulo: `Excluir “${deck.title}”?`,
      mensagem: `O baralho e ${plural(deck.cardCount, "ficha", "fichas")} saem de “Baralhos prontos”. Quem já adicionou uma cópia continua com ela.`,
      confirmar: "Excluir baralho",
      perigo: true,
    });
    if (!ok) return;
    setError("");
    setStatus("");
    try {
      await deleteSharedDeck(deck.id);
      setStatus(`“${deck.title}” excluído.`);
      load();
      // O cartão (e o botão que tinha o foco) sumiu: o foco volta para o título da página
      tituloRef.current?.focus();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Não foi possível excluir. Tente de novo.");
    }
  };

  return (
    <main id="conteudo">
      <div className="cabecalho">
        <div>
          <h1 ref={tituloRef} tabIndex={-1}>
            Baralhos compartilhados
          </h1>
          <p className="suave">
            Aparecem em &ldquo;Baralhos prontos&rdquo; no CardVoz. Cada pessoa adiciona uma cópia; mudar ou excluir
            aqui não altera as cópias já feitas.
          </p>
        </div>
        <Link href="/baralhos/editar/" className="botao">
          Novo baralho compartilhado
        </Link>
      </div>

      <p role="status" className={status ? "sucesso" : "sr-only"}>
        {status}
      </p>
      {error && (
        <div className="cartao">
          <p role="alert" className="erro">
            {error}
          </p>
          <div className="acoes">
            <button type="button" onClick={load}>
              Tentar de novo
            </button>
          </div>
        </div>
      )}

      {!decks && !error && (
        <>
          <p role="status" className="sr-only">
            Carregando baralhos...
          </p>
          <div className="grade" aria-hidden="true">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="cartao baralho">
                <span className="esqueleto" style={{ width: "70%", height: "1.5rem" }} />
                <span className="esqueleto" style={{ width: "40%", height: "1.25rem" }} />
                <span className="esqueleto" style={{ width: "100%", height: "3rem" }} />
              </div>
            ))}
          </div>
        </>
      )}

      {decks && decks.length === 0 && (
        <div className="cartao vazio">
          <h2>Nenhum baralho compartilhado ainda</h2>
          <p className="suave">Crie o primeiro: ele aparece para todo mundo em &ldquo;Baralhos prontos&rdquo;.</p>
          <Link href="/baralhos/editar/" className="botao">
            Criar o primeiro baralho
          </Link>
        </div>
      )}

      {decks && decks.length > 0 && (
        <ul className="grade">
          {decks.map((deck) => (
            <li key={deck.id} className="cartao baralho">
              <div className="baralho-texto">
                <h2>{deck.title}</h2>
                <p className="suave">
                  {plural(deck.cardCount, "ficha", "fichas")} · atualizado em{" "}
                  {formatDate(deck.updatedAt || deck.createdAt)}
                </p>
                {deck.description && <p className="baralho-descricao">{deck.description}</p>}
              </div>
              <div className="acoes">
                <Link
                  href={`/baralhos/editar/?id=${deck.id}`}
                  className="botao secundario"
                  aria-label={`Editar: ${deck.title}`}
                >
                  Editar
                </Link>
                <button type="button" className="perigo" onClick={() => remove(deck)} aria-label={`Excluir: ${deck.title}`}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {dialogo}
    </main>
  );
}
