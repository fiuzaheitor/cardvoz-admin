"use client";

import { useEffect, useState } from "react";
import { ApiError, getStats, type Stats } from "@/lib/api";

const LABELS: [keyof Stats, string][] = [
  ["users", "Usuários"],
  ["admins", "Admins"],
  ["decks", "Baralhos dos usuários"],
  ["sharedDecks", "Baralhos compartilhados"],
  ["cards", "Fichas"],
  ["studySessions", "Sessões de estudo"],
];

export default function PainelPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Não foi possível carregar os números."));
  }, []);

  return (
    <main id="conteudo">
      <h1>Painel</h1>
      {error && <p role="alert" className="erro">{error}</p>}
      {!stats && !error && <p role="status">Carregando...</p>}
      {stats && (
        <dl className="numeros">
          {LABELS.map(([key, label]) => (
            <div key={key} className="cartao">
              <dt>{label}</dt>
              <dd>{stats[key]}</dd>
            </div>
          ))}
        </dl>
      )}
    </main>
  );
}
