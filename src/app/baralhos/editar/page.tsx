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
  const titleRef = useRef<HTMLInputElement>(null);
  const lastQuestionRef = useRef<HTMLTextAreaElement>(null);
  const focusNewCard = useRef(false);

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

  // Depois de "Adicionar ficha", o foco vai para a pergunta nova
  useEffect(() => {
    if (focusNewCard.current) {
      focusNewCard.current = false;
      lastQuestionRef.current?.focus();
    }
  }, [cards.length]);

  const updateCard = (index: number, field: keyof CardInput, value: string) =>
    setCards((current) => current.map((card, i) => (i === index ? { ...card, [field]: value } : card)));

  const addCard = () => {
    focusNewCard.current = true;
    setCards((current) => [...current, { ...EMPTY }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    // Fichas totalmente vazias são ignoradas; meio preenchidas são erro
    const filled = cards.filter((c) => c.question.trim() || c.answer.trim());
    const incomplete = filled.findIndex((c) => !c.question.trim() || !c.answer.trim());
    let problem = "";
    if (!title.trim()) problem = "Escreva um título para o baralho.";
    else if (filled.length === 0) problem = "Adicione pelo menos uma ficha com pergunta e resposta.";
    else if (incomplete >= 0) problem = `A ficha ${cards.indexOf(filled[incomplete]) + 1} precisa de pergunta e resposta.`;
    if (problem) {
      setError(problem);
      titleRef.current?.focus();
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
            <input ref={titleRef} value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
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
                    ref={i === cards.length - 1 ? lastQuestionRef : undefined}
                    rows={2}
                    value={card.question}
                    onChange={(e) => updateCard(i, "question", e.target.value)}
                  />
                </label>
                <label>
                  Resposta
                  <textarea rows={2} value={card.answer} onChange={(e) => updateCard(i, "answer", e.target.value)} />
                </label>
                {cards.length > 1 && (
                  <button
                    type="button"
                    className="secundario"
                    onClick={() => setCards((current) => current.filter((_, j) => j !== i))}
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
