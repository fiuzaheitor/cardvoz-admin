"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Pedido {
  titulo: string;
  mensagem: string;
  /** Texto do botão que confirma (começa com verbo: "Excluir conta") */
  confirmar: string;
  cancelar?: string;
  /** Ação que apaga dados: botão vermelho */
  perigo?: boolean;
}

/**
 * Pergunta de confirmação num <dialog> nativo (foco preso, Esc fecha, o foco volta
 * para quem abriu). Uso: `const [confirmar, dialogo] = useConfirmar();` e
 * `if (await confirmar({...})) ...`, com {dialogo} na página.
 */
export function useConfirmar() {
  const ref = useRef<HTMLDialogElement>(null);
  const resolver = useRef<(ok: boolean) => void>(() => {});
  const [pedido, setPedido] = useState<Pedido | null>(null);

  const confirmar = useCallback(
    (novo: Pedido) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setPedido(novo);
      }),
    []
  );

  useEffect(() => {
    if (pedido && !ref.current?.open) ref.current?.showModal();
  }, [pedido]);

  const fechar = (ok: boolean) => {
    ref.current?.close();
    setPedido(null);
    resolver.current(ok);
  };

  const dialogo = (
    <dialog
      ref={ref}
      aria-labelledby="confirmar-titulo"
      aria-describedby="confirmar-texto"
      onCancel={(e) => {
        e.preventDefault();
        fechar(false);
      }}
    >
      {pedido && (
        <div className="dialogo-conteudo">
          <h2 id="confirmar-titulo">{pedido.titulo}</h2>
          <p id="confirmar-texto">{pedido.mensagem}</p>
          <div className="dialogo-acoes">
            {/* "Cancelar" vem primeiro: é ele que recebe o foco ao abrir */}
            <button type="button" className="secundario" onClick={() => fechar(false)}>
              {pedido.cancelar ?? "Cancelar"}
            </button>
            <button type="button" className={pedido.perigo ? "perigo-forte" : undefined} onClick={() => fechar(true)}>
              {pedido.confirmar}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );

  return [confirmar, dialogo] as const;
}
