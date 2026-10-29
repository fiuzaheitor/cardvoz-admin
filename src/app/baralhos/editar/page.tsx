"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, getSharedDeck, saveSharedDeck, type CardInput } from "@/lib/api";

const EMPTY: CardInput = { question: "", answer: "" };

function EditarContent() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<CardInput[]>([{ ...EMPTY }]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Campo que recebe o foco depois que a lista de fichas mudar (adicionar ou remover)
  const focusAfterRender = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getSharedDeck(id)
      .then((deck) => {
        setTitle(deck.title);
        setDescription(deck.description ?? "");
        setCards(deck.cards.map(({ question, answer }) => ({ question, answer })));
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Não foi possível carregar o baralho."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (focusAfterRender.current) {
      document.getElementById(focusAfterRender.current)?.focus();
      focusAfterRender.current = null;
    }
  }, [cards]);

  const updateCard = (index: number, field: keyof CardInput, value: string) =>
    setCards((current) => current.map((card, i) => (i === index ? { ...card, [field]: value } : card)));

  const addCard = () => {
    focusAfterRender.current = `ficha-${cards.length}-pergunta`;
    setCards((current) => [...current, { ...EMPTY }]);
  };

  // O botão some junto com a ficha: o foco vai para a ficha que ficou no lugar (ou a anterior)
  const removeCard = (index: number) => {
    focusAfterRender.current = `ficha-${Math.min(index, cards.length - 2)}-pergunta`;
    setCards((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    // Fichas totalmente vazias são ignoradas; meio preenchidas são erro
    const filled = cards.filter((c) => c.question.trim() || c.answer.trim());
    const incomplete = cards.findIndex(
      (c) => (c.question.trim() || c.answer.trim()) && !(c.question.trim() && c.answer.trim())
    );
    // Mensagem e o campo que recebe o foco, para ir direto ao problema
    let problem: [string, string] | null = null;
    if (!title.trim()) problem = ["Escreva um título para o baralho.", "titulo"];
    else if (filled.length === 0) problem = ["Adicione pelo menos uma ficha com pergunta e resposta.", "ficha-0-pergunta"];
    else if (incomplete >= 0)
      problem = [
        `A ficha ${incomplete + 1} precisa de pergunta e resposta.`,
        `ficha-${incomplete}-${cards[incomplete].question.trim() ? "resposta" : "pergunta"}`,
      ];
    if (problem) {
      setError(problem[0]);
      document.getElementById(problem[1])?.focus();
      return;
    }

    setSaving(true);
    setError("");
    try {
      await saveSharedDeck(id, { title: title.trim(), description: description.trim(), cards: filled });
      router.push("/baralhos/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar. Tente de novo.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main id="conteudo">
        <p role="status">Carregando baralho...</p>
      </main>
    );
  }

  return (
    <main id="conteudo">
      <p>
        <Link href="/baralhos/">Voltar aos baralhos compartilhados</Link>
      </p>
      <h1>{id ? "Editar baralho compartilhado" : "Novo baralho compartilhado"}</h1>
      {id && (
        <p className="suave">Salvar substitui o título e as fichas. As cópias que as pessoas já fizeram não mudam.</p>
      )}
      {error && <p role="alert" className="erro">{error}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="cartao">
          <label>
            Título
            <input id="titulo" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Descrição (opcional)
            <textarea
              rows={2}
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>

        <h2>Fichas ({cards.length})</h2>
        <ol className="fichas">
          {cards.map((card, i) => (
            <li key={i} className="cartao">
              <fieldset>
                <legend>Ficha {i + 1}</legend>
                <label>
                  Pergunta
                  <textarea
                    id={`ficha-${i}-pergunta`}
                    rows={2}
                    value={card.question}
                    onChange={(e) => updateCard(i, "question", e.target.value)}
                  />
                </label>
                <label>
                  Resposta
                  <textarea
                    id={`ficha-${i}-resposta`}
                    rows={2}
                    value={card.answer}
                    onChange={(e) => updateCard(i, "answer", e.target.value)}
                  />
                </label>
                {cards.length > 1 && (
                  <button
                    type="button"
                    className="secundario"
                    onClick={() => removeCard(i)}
                  >
                    Remover ficha {i + 1}
                  </button>
                )}
              </fieldset>
            </li>
          ))}
        </ol>

        <div className="barra">
          <button type="button" className="secundario" onClick={addCard}>
            Adicionar ficha
          </button>
          <button type="submit" aria-disabled={saving || undefined}>
            {saving ? "Salvando..." : "Salvar baralho"}
          </button>
        </div>
      </form>
    </main>
  );
}

// useSearchParams exige Suspense no site estático
export default function EditarPage() {
  return (
    <Suspense fallback={<main id="conteudo"><p role="status">Carregando...</p></main>}>
      <EditarContent />
    </Suspense>
  );
}
