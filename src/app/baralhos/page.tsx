"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, deleteSharedDeck, formatDate, getSharedDecks, type Deck } from "@/lib/api";

export default function BaralhosPage() {
  const [decks, setDecks] = useState<Deck[] | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(() => {
    getSharedDecks()
      .then(setDecks)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Não foi possível carregar os baralhos."));
  }, []);

  useEffect(load, [load]);

  const remove = async (deck: Deck) => {
    if (!window.confirm(`Excluir "${deck.title}"? Quem já adicionou uma cópia continua com ela.`)) return;
    setError("");
    setStatus("");
    try {
      await deleteSharedDeck(deck.id);
      setStatus(`"${deck.title}" excluído.`);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Não foi possível excluir. Tente de novo.");
    }
  };

  return (
    <main id="conteudo">
      <h1>Baralhos compartilhados</h1>
      <p className="suave">
        Aparecem em &ldquo;Baralhos prontos&rdquo; no CardVoz. Cada pessoa adiciona uma cópia aos próprios
        baralhos; mudar ou excluir aqui não altera as cópias já feitas.
      </p>
      <p>
        <Link href="/baralhos/editar/" className="botao">
          Novo baralho compartilhado
        </Link>
      </p>
      <p role="status" className={status ? "sucesso" : "sr-only"}>{status}</p>
      {error && <p role="alert" className="erro">{error}</p>}
      {!decks && !error && <p>Carregando...</p>}
      {decks && decks.length === 0 && <p>Nenhum baralho compartilhado ainda.</p>}
      {decks && decks.length > 0 && (
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Fichas</th>
                <th scope="col">Atualizado em</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {decks.map((deck) => (
                <tr key={deck.id}>
                  <th scope="row">{deck.title}</th>
                  <td>{deck.cardCount}</td>
                  <td>{formatDate(deck.updatedAt || deck.createdAt)}</td>
                  <td className="acoes">
                    <Link
                      href={`/baralhos/editar/?id=${deck.id}`}
                      className="botao secundario"
                      aria-label={`Editar: ${deck.title}`}
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="perigo"
                      onClick={() => remove(deck)}
                      aria-label={`Excluir: ${deck.title}`}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
