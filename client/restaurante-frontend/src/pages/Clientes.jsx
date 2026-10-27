import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Users,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Trash2,
  AlertCircle,
  X,
  Clock3,
  Utensils,
} from "lucide-react";

const API_URL = "/api";

async function requisicao(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let mensagem = "Não foi possível realizar a operação.";

    try {
      const erro = await response.json();
      mensagem = erro.mensagem || erro.message || mensagem;
    } catch {
      mensagem = response.statusText || mensagem;
    }

    throw new Error(mensagem);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function formatarData(data) {
  if (!data) return "Não informada";

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Não informada";
  }

  return dataFormatada.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obterNumeroMesa(cliente) {
  return cliente?.comanda?.mesa?.numero ?? "Não identificada";
}

function obterStatus(cliente) {
  return cliente.autorizado === true;
}

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [clienteEmAtualizacao, setClienteEmAtualizacao] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

const carregarClientes = useCallback(async () => {
  try {
    const dados = await requisicao("/sessoes");

    setClientes(Array.isArray(dados) ? dados : []);
    setErro("");
  } catch (error) {
    setErro(error.message || "Não foi possível carregar os clientes.");
  } finally {
    setCarregando(false);
    setAtualizando(false);
  }
}, []);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  async function alterarAutorizacao(cliente) {
    const autorizado = !obterStatus(cliente);

    setClienteEmAtualizacao(cliente.id);
    setErro("");
    setMensagem("");

    try {
      const atualizado = await requisicao(
        `/sessoes/${cliente.id}/autorizacao`,
        {
          method: "PATCH",
          body: JSON.stringify({ autorizado }),
        }
      );

      setClientes((atuais) =>
        atuais.map((item) =>
          item.id === cliente.id ? atualizado : item
        )
      );

      setMensagem(
        `${cliente.nome || "Cliente"} ${
          autorizado ? "autorizado" : "sem autorização"
        } com sucesso.`
      );
    } catch (error) {
      setErro(error.message || "Não foi possível alterar a autorização.");
    } finally {
      setClienteEmAtualizacao(null);
    }
  }

  async function excluirCliente(cliente) {
    const confirmar = window.confirm(
      `Deseja realmente excluir a sessão de ${
        cliente.nome || "este cliente"
      }?`
    );

    if (!confirmar) return;

    setClienteEmAtualizacao(cliente.id);
    setErro("");
    setMensagem("");

    try {
      await requisicao(`/sessoes/${cliente.id}`, {
        method: "DELETE",
      });

      setClientes((atuais) =>
        atuais.filter((item) => item.id !== cliente.id)
      );

      setMensagem("Sessão excluída com sucesso.");
    } catch (error) {
      setErro(error.message || "Não foi possível excluir a sessão.");
    } finally {
      setClienteEmAtualizacao(null);
    }
  }

  const clientesFiltrados = clientes.filter((cliente) =>
    (cliente.nome || "")
      .toLowerCase()
      .includes(pesquisa.trim().toLowerCase())
  );

  const clientesAutorizados = clientes.filter(obterStatus).length;
  const clientesSemAutorizacao = clientes.length - clientesAutorizados;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Gestão do restaurante
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Clientes
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Gerencie as pessoas conectadas às comandas do restaurante.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAtualizando(true);
            carregarClientes();
          }}
          disabled={atualizando || carregando}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={atualizando ? "animate-spin" : ""}
          />
          Atualizar lista
        </button>
      </header>

      {erro && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">Não foi possível concluir a operação</p>
            <p className="mt-1">{erro}</p>
          </div>

          <button
            type="button"
            onClick={() => setErro("")}
            aria-label="Fechar mensagem de erro"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {mensagem && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <p>{mensagem}</p>

          <button
            type="button"
            onClick={() => setMensagem("")}
            aria-label="Fechar mensagem"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total de sessões</p>
            <Users size={21} className="text-blue-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {carregando ? "—" : clientes.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Pessoas registradas nas comandas
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Autorizados</p>
            <ShieldCheck size={21} className="text-emerald-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {carregando ? "—" : clientesAutorizados}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Sessões com autorização ativa
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Não autorizados</p>
            <ShieldX size={21} className="text-amber-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {carregando ? "—" : clientesSemAutorizacao}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Sessões sem autorização ativa
          </p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Pessoas nas comandas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {clientesFiltrados.length}{" "}
              {clientesFiltrados.length === 1
                ? "sessão encontrada"
                : "sessões encontradas"}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
              placeholder="Pesquisar por nome..."
              aria-label="Pesquisar clientes por nome"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {carregando ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw size={25} className="animate-spin text-blue-600" />
            <p className="text-sm">Carregando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
              <Users size={28} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Nenhuma sessão encontrada
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {pesquisa
                ? "Tente pesquisar utilizando outro nome."
                : "Quando alguém entrar em uma comanda, aparecerá nesta lista."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Cliente</th>
                  <th className="px-5 py-4 font-semibold">Mesa</th>
                  <th className="px-5 py-4 font-semibold">Entrada</th>
                  <th className="px-5 py-4 font-semibold">Autorização</th>
                  <th className="px-5 py-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {clientesFiltrados.map((cliente) => {
                  const autorizado = obterStatus(cliente);
                  const emAtualizacao = clienteEmAtualizacao === cliente.id;

                  return (
                    <tr key={cliente.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                            {(cliente.nome || "?").charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {cliente.nome || "Cliente sem nome"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Sessão #{cliente.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Utensils size={16} className="text-slate-400" />
                          Mesa {obterNumeroMesa(cliente)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock3 size={16} className="text-slate-400" />
                          {formatarData(cliente.dataEntrada)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            autorizado
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {autorizado ? (
                            <ShieldCheck size={14} />
                          ) : (
                            <ShieldX size={14} />
                          )}

                          {autorizado ? "Autorizado" : "Não autorizado"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => alterarAutorizacao(cliente)}
                            disabled={emAtualizacao}
                            title={autorizado ? "Revogar autorização" : "Autorizar sessão"}
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              autorizado
                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {emAtualizacao ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : autorizado ? (
                              <ShieldX size={15} />
                            ) : (
                              <ShieldCheck size={15} />
                            )}

                            {autorizado ? "Revogar" : "Autorizar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => excluirCliente(cliente)}
                            disabled={emAtualizacao}
                            title="Excluir sessão"
                            aria-label={`Excluir sessão de ${cliente.nome || "cliente"}`}
                            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Clientes;