"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, deleteUser, formatDate, getUsers, setAdmin, type AdminUser } from "@/lib/api";
import { useSession } from "../Painel";

const message = (e: unknown) => (e instanceof ApiError ? e.message : "Algo deu errado. Tente de novo.");

export default function UsuariosPage() {
  const { user: me } = useSession();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    getUsers().then(setUsers).catch((e) => setError(message(e)));
  }, []);

  useEffect(load, [load]);

  const run = async (target: AdminUser, action: () => Promise<void>, done: string) => {
    if (busyId) return;
    setBusyId(target.id);
    setError("");
    setStatus("");
    try {
      await action();
      setStatus(done);
      load();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusyId(null);
    }
  };

  const toggleAdmin = (u: AdminUser) =>
    run(
      u,
      () => setAdmin(u.id, !u.isAdmin),
      u.isAdmin ? `${u.name} não é mais admin.` : `${u.name} agora é admin.`
    );

  const remove = (u: AdminUser) => {
    const decks = u.deckCount === 1 ? "1 baralho" : `${u.deckCount} baralhos`;
    if (!window.confirm(`Excluir a conta de ${u.name} (${u.email}) e ${decks}? Isso não pode ser desfeito.`)) return;
    void run(u, () => deleteUser(u.id), `Conta de ${u.name} excluída.`);
  };

  return (
    <main id="conteudo">
      <h1>Usuários</h1>
      <p role="status" className={status ? "sucesso" : "sr-only"}>{status}</p>
      {error && <p role="alert" className="erro">{error}</p>}
      {!users && !error && <p>Carregando...</p>}
      {users && (
        <div className="tabela">
          <table>
            <caption className="sr-only">{users.length} contas</caption>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">E-mail</th>
                <th scope="col">Entra com</th>
                <th scope="col">Baralhos</th>
                <th scope="col">Criada em</th>
                <th scope="col">Admin</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <th scope="row">{u.name}{u.id === me?.id && " (você)"}</th>
                  <td>{u.email}</td>
                  <td>{[u.hasPassword && "Senha", u.hasGoogle && "Google"].filter(Boolean).join(" e ")}</td>
                  <td>{u.deckCount}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>{u.isAdmin ? "Sim" : "Não"}</td>
                  <td className="acoes">
                    {u.id !== me?.id && (
                      <>
                        <button
                          type="button"
                          className="secundario"
                          aria-disabled={busyId === u.id || undefined}
                          onClick={() => toggleAdmin(u)}
                          aria-label={`${u.isAdmin ? "Tirar admin" : "Tornar admin"}: ${u.name}`}
                        >
                          {u.isAdmin ? "Tirar admin" : "Tornar admin"}
                        </button>
                        <button
                          type="button"
                          className="perigo"
                          aria-disabled={busyId === u.id || undefined}
                          onClick={() => remove(u)}
                          aria-label={`Excluir: ${u.name}`}
                        >
                          Excluir
                        </button>
                      </>
                    )}
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
