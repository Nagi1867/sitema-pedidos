import { useCallback, useEffect, useState } from "react";
import {
  ClipboardList,
  RefreshCw,
  Search,
  ExternalLink,
  X,
  Clock,
  CheckCircle2,
  CircleDollarSign,
  LoaderCircle,
  AlertCircle,
  CreditCard,
  Users,
} from "lucide-react";

import ParticipantesComanda from "../components/ParticipantesComanda";

const API_URL = "/api";

const filtros = [
  { valor: "TODAS", label: "Todas" },
  { valor: "ABERTA", label: "Abertas" },
  { valor: "AGUARDANDO_PAGAMENTO", label: "Aguardando pagamento" },
  { valor: "FECHADA", label: "Fechadas" },
  { valor: "CANCELADA", label: "Canceladas" },
];

async function requisicao(endpoint, options = {}) {
  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!resposta.ok) {
    let mensagem = "Não foi possível realizar a operação.";

    try {
      const erro = await resposta.json();
      mensagem = erro.mensagem || erro.message || mensagem;
    } catch {
      mensagem = resposta.statusText || mensagem;
    }

    throw new Error(mensagem);
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) {
    return "Não informada";
  }

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Não informada";
  }

  return dataFormatada.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function obterStatus(status) {
  const estilos = {
    ABERTA: "bg-emerald-50 text-emerald-700 border-emerald-200",
    AGUARDANDO_PAGAMENTO:
      "bg-amber-50 text-amber-700 border-amber-200",
    FECHADA: "bg-blue-50 text-blue-700 border-blue-200",
    CANCELADA: "bg-red-50 text-red-700 border-red-200",
  };

  const nomes = {
    ABERTA: "Aberta",
    AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
    FECHADA: "Fechada",
    CANCELADA: "Cancelada",
  };

  return {
    classe:
      estilos[status] || "bg-gray-100 text-gray-600 border-gray-200",
    nome: nomes[status] || status || "Desconhecido",
  };
}

function Comandas() {
  const [comandas, setComandas] = useState([]);
  const [filtro, setFiltro] = useState("TODAS");
  const [pesquisa, setPesquisa] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [comandaSelecionada, setComandaSelecionada] = useState(null);
  const [encerrando, setEncerrando] = useState(false);

  const [contas, setContas] = useState([]);
  const [carregandoContas, setCarregandoContas] = useState(false);
  const [erroContas, setErroContas] = useState("");
  const [valoresPagamento, setValoresPagamento] = useState({});
  const [pagandoCliente, setPagandoCliente] = useState(null);

  const carregarComandas = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const dados = await requisicao("/comandas");
      setComandas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErro(error.message || "Não foi possível carregar as comandas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarContas = useCallback(async (comandaId) => {
    if (!comandaId) {
      setContas([]);
      return;
    }

    setCarregandoContas(true);
    setErroContas("");

    try {
      const dados = await requisicao(`/comandas/${comandaId}/contas`);
      setContas(Array.isArray(dados) ? dados : []);
    } catch (error) {
      setErroContas(
        error.message || "Não foi possível carregar as contas individuais."
      );
      setContas([]);
    } finally {
      setCarregandoContas(false);
    }
  }, []);

  useEffect(() => {
    carregarComandas();
  }, [carregarComandas]);

  useEffect(() => {
    if (comandaSelecionada?.id) {
      carregarContas(comandaSelecionada.id);
    } else {
      setContas([]);
      setErroContas("");
      setValoresPagamento({});
    }
  }, [comandaSelecionada?.id, carregarContas]);

  const comandasFiltradas = comandas.filter((comanda) => {
    const status = String(comanda.status || "").toUpperCase();

    const correspondeStatus =
      filtro === "TODAS" || status === filtro;

    const numeroMesa = String(
      comanda.mesa?.numero ?? comanda.mesaId ?? ""
    );

    const identificador = String(comanda.id ?? "");
    const termo = pesquisa.trim();

    const correspondePesquisa =
      numeroMesa.includes(termo) ||
      identificador.includes(termo);

    return correspondeStatus && correspondePesquisa;
  });

  const abertas = comandas.filter(
    (comanda) => comanda.status === "ABERTA"
  ).length;

  const aguardandoPagamento = comandas.filter(
    (comanda) => comanda.status === "AGUARDANDO_PAGAMENTO"
  ).length;

  const totalEmAberto = comandas
    .filter((comanda) =>
      ["ABERTA", "AGUARDANDO_PAGAMENTO"].includes(comanda.status)
    )
    .reduce(
      (total, comanda) => total + Number(comanda.valorTotal || 0),
      0
    );

  const totalContas = contas.reduce(
    (total, conta) => total + Number(conta.valorTotal || 0),
    0
  );

  const totalPago = contas.reduce(
    (total, conta) => total + Number(conta.valorPago || 0),
    0
  );

  const totalPendente = contas.reduce(
    (total, conta) => total + Number(conta.saldoPendente || 0),
    0
  );

  function obterLinkCliente(comanda) {
    return `${window.location.origin}/comanda/${comanda.codigoAcesso}`;
  }

  async function copiarLink(comanda) {
    if (!comanda.codigoAcesso) {
      setErro("Esta comanda não possui código de acesso.");
      return;
    }

    try {
      await navigator.clipboard.writeText(obterLinkCliente(comanda));
      setMensagem("Link da comanda copiado!");
      setErro("");

      setTimeout(() => setMensagem(""), 3000);
    } catch {
      setErro("Não foi possível copiar o link.");
    }
  }

  function atualizarValorPagamento(clienteSessaoId, valor) {
    setValoresPagamento((valores) => ({
      ...valores,
      [clienteSessaoId]: valor,
    }));
  }

  async function registrarPagamento(conta) {
    const valorInformado = String(
      valoresPagamento[conta.clienteSessaoId] ?? ""
    ).trim();

    const valor = Number(valorInformado.replace(",", "."));

    if (!valorInformado || !Number.isFinite(valor) || valor <= 0) {
      setErroContas("Informe um valor de pagamento válido.");
      return;
    }

    if (valor > Number(conta.saldoPendente || 0)) {
      setErroContas("O pagamento não pode ser maior que o saldo pendente.");
      return;
    }

    setPagandoCliente(conta.clienteSessaoId);
    setErroContas("");
    setMensagem("");

    try {
      await requisicao(
        `/comandas/${comandaSelecionada.id}/contas/${conta.clienteSessaoId}/pagamentos`,
        {
          method: "POST",
          body: JSON.stringify({ valor }),
        }
      );

      atualizarValorPagamento(conta.clienteSessaoId, "");

      await carregarContas(comandaSelecionada.id);
      await carregarComandas();

      setMensagem(
        `Pagamento de ${formatarMoeda(valor)} registrado para ${
          conta.nome || `participante #${conta.clienteSessaoId}`
        }.`
      );

      setTimeout(() => setMensagem(""), 4000);
    } catch (error) {
      setErroContas(
        error.message || "Não foi possível registrar o pagamento."
      );
    } finally {
      setPagandoCliente(null);
    }
  }

  async function encerrarComanda(comanda) {
    if (totalPendente > 0) {
      setErroContas(
        "Ainda existem contas com saldo pendente. Registre os pagamentos antes de encerrar a comanda."
      );
      return;
    }

    const confirmar = window.confirm(
      `Deseja encerrar a comanda da mesa ${
        comanda.mesa?.numero ?? "não identificada"
      }?`
    );

    if (!confirmar) {
      return;
    }

    setEncerrando(true);
    setErro("");
    setMensagem("");

    try {
      await requisicao(`/comandas/${comanda.id}/fechar`, {
        method: "PATCH",
      });

      setMensagem("Comanda encerrada com sucesso.");
      setComandaSelecionada(null);

      await carregarComandas();
    } catch (error) {
      setErro(error.message || "Não foi possível encerrar a comanda.");
    } finally {
      setEncerrando(false);
    }
  }

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-6 text-gray-900 md:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-blue-600">
            <ClipboardList size={17} />
            Gerenciamento
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Comandas</h1>

          <p className="mt-2 text-sm text-gray-500">
            Acompanhe as comandas e os valores das mesas do restaurante.
          </p>
        </div>

        <button
          onClick={carregarComandas}
          disabled={carregando}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={carregando ? "animate-spin" : ""}
          />
          Atualizar
        </button>
      </header>

      {erro && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span>{erro}</span>
          <button
            onClick={() => setErro("")}
            className="ml-auto text-red-700 hover:text-red-900"
            aria-label="Fechar mensagem de erro"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {mensagem && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={19} />
          <span>{mensagem}</span>
          <button
            onClick={() => setMensagem("")}
            className="ml-auto hover:text-emerald-900"
            aria-label="Fechar mensagem"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total de comandas</span>
            <ClipboardList className="text-blue-600" size={21} />
          </div>
          <p className="mt-4 text-3xl font-bold">{comandas.length}</p>
          <p className="mt-2 text-xs text-gray-500">
            Registradas no sistema
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Comandas abertas</span>
            <Clock className="text-emerald-600" size={21} />
          </div>
          <p className="mt-4 text-3xl font-bold">{abertas}</p>
          <p className="mt-2 text-xs text-gray-500">Em atendimento</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Aguardando pagamento
            </span>
            <CircleDollarSign className="text-amber-600" size={21} />
          </div>
          <p className="mt-4 text-3xl font-bold">{aguardandoPagamento}</p>
          <p className="mt-2 text-xs text-gray-500">
            Pendentes de pagamento
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Valor em aberto</span>
            <CircleDollarSign className="text-blue-600" size={21} />
          </div>
          <p className="mt-4 text-2xl font-bold">
            {formatarMoeda(totalEmAberto)}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Soma das comandas não encerradas
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5">
          <div>
            <h2 className="text-lg font-semibold">Comandas registradas</h2>
            <p className="mt-1 text-sm text-gray-500">
              Selecione uma comanda para consultar suas informações.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filtros.map((item) => (
                <button
                  key={item.valor}
                  onClick={() => setFiltro(item.valor)}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    filtro === item.valor
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                placeholder="Buscar por mesa ou ID..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
            <LoaderCircle
              size={30}
              className="animate-spin text-blue-600"
            />
            <p className="text-sm">Carregando comandas...</p>
          </div>
        ) : comandasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="mb-4 rounded-2xl bg-gray-100 p-4">
              <ClipboardList size={32} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900">
              Nenhuma comanda encontrada
            </h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Não existem comandas para os filtros selecionados. Você pode
              abrir uma comanda na página de mesas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Comanda</th>
                  <th className="px-5 py-4 font-medium">Mesa</th>
                  <th className="px-5 py-4 font-medium">Abertura</th>
                  <th className="px-5 py-4 font-medium">Valor total</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {comandasFiltradas.map((comanda) => {
                  const status = obterStatus(comanda.status);

                  return (
                    <tr
                      key={comanda.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900">
                          #{comanda.id}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                          Mesa{" "}
                          {comanda.mesa?.numero ?? comanda.mesaId ?? "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatarData(comanda.dataAbertura)}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-900">
                        {formatarMoeda(comanda.valorTotal)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${status.classe}`}
                        >
                          {status.nome}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setComandaSelecionada(comanda)}
                            title="Ver detalhes"
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                          >
                            <ClipboardList size={17} />
                          </button>

                          {comanda.codigoAcesso && (
                            <button
                              onClick={() => copiarLink(comanda)}
                              title="Copiar link do cliente"
                              className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                            >
                              <ExternalLink size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!carregando && comandasFiltradas.length > 0 && (
          <div className="border-t border-gray-200 px-5 py-4 text-sm text-gray-500">
            Exibindo {comandasFiltradas.length} de {comandas.length} comandas
          </div>
        )}
      </section>

      {comandaSelecionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm"
          onClick={() => setComandaSelecionada(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-blue-600">
                  Detalhes da comanda
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  Comanda #{comandaSelecionada.id}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Mesa{" "}
                  {comandaSelecionada.mesa?.numero ??
                    comandaSelecionada.mesaId ??
                    "não identificada"}
                </p>
              </div>

              <button
                onClick={() => setComandaSelecionada(null)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Fechar detalhes"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <span className="text-sm text-gray-500">Status</span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    obterStatus(comandaSelecionada.status).classe
                  }`}
                >
                  {obterStatus(comandaSelecionada.status).nome}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <span className="text-sm text-gray-500">
                  Data de abertura
                </span>
                <span className="text-sm text-gray-900">
                  {formatarData(comandaSelecionada.dataAbertura)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <span className="text-sm text-gray-500">
                  Valor total da comanda
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatarMoeda(comandaSelecionada.valorTotal)}
                </span>
              </div>

              {comandaSelecionada.codigoAcesso && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-900">
                    Acesso do cliente
                  </p>
                  <p className="mt-2 break-all text-xs text-gray-500">
                    {obterLinkCliente(comandaSelecionada)}
                  </p>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => copiarLink(comandaSelecionada)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      <ExternalLink size={16} />
                      Copiar link
                    </button>

                    <a
                      href={obterLinkCliente(comandaSelecionada)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Abrir página
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3">
                  <Users size={22} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Contas individuais
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Consulte o consumo e registre o pagamento de cada
                    participante separadamente.
                  </p>
                </div>
              </div>

              {erroContas && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{erroContas}</span>
                  <button
                    onClick={() => setErroContas("")}
                    className="ml-auto"
                    aria-label="Fechar erro das contas"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {carregandoContas ? (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 py-12 text-sm text-gray-500">
                  <LoaderCircle
                    size={22}
                    className="animate-spin text-blue-600"
                  />
                  Carregando contas individuais...
                </div>
              ) : contas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center">
                  <Users
                    size={28}
                    className="mx-auto mb-3 text-gray-400"
                  />
                  <p className="font-medium text-gray-700">
                    Nenhuma conta individual encontrada
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Os participantes aparecerão aqui quando houver sessões
                    vinculadas à comanda.
                  </p>
                  <button
                    onClick={() =>
                      carregarContas(comandaSelecionada.id)
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw size={15} />
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        Total das contas
                      </p>
                      <p className="mt-2 text-lg font-bold">
                        {formatarMoeda(totalContas)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs text-emerald-700">
                        Total recebido
                      </p>
                      <p className="mt-2 text-lg font-bold text-emerald-800">
                        {formatarMoeda(totalPago)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs text-amber-700">
                        Saldo pendente
                      </p>
                      <p className="mt-2 text-lg font-bold text-amber-800">
                        {formatarMoeda(totalPendente)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {contas.map((conta) => {
                      const saldo = Number(conta.saldoPendente || 0);
                      const pago = Boolean(conta.pago) || saldo <= 0;
                      const estaPagando =
                        pagandoCliente === conta.clienteSessaoId;
                      const podeRegistrar =
                        ["ABERTA", "AGUARDANDO_PAGAMENTO"].includes(
                          comandaSelecionada.status
                        );

                      return (
                        <article
                          key={conta.clienteSessaoId}
                          className="overflow-hidden rounded-xl border border-gray-200"
                        >
                          <div className="flex flex-col gap-4 bg-gray-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-semibold text-gray-900">
                                  {conta.nome?.trim() ||
                                    `Participante #${conta.clienteSessaoId}`}
                                </h4>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                                    pago
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-amber-200 bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  {pago ? "Pago" : "Pendente"}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-gray-500">
                                Participante #{conta.clienteSessaoId}
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 sm:min-w-[330px]">
                              <div>
                                <p className="text-xs text-gray-500">
                                  Consumo
                                </p>
                                <p className="mt-1 text-sm font-semibold">
                                  {formatarMoeda(conta.valorTotal)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500">Pago</p>
                                <p className="mt-1 text-sm font-semibold text-emerald-700">
                                  {formatarMoeda(conta.valorPago)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500">
                                  Pendente
                                </p>
                                <p
                                  className={`mt-1 text-sm font-semibold ${
                                    saldo > 0
                                      ? "text-amber-700"
                                      : "text-emerald-700"
                                  }`}
                                >
                                  {formatarMoeda(saldo)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4">
                            {Array.isArray(conta.itens) &&
                              conta.itens.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="mb-2 text-sm font-medium text-gray-700">
                                    Itens da conta
                                  </h5>

                                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                                    <table className="w-full min-w-[480px] text-left text-sm">
                                      <thead className="bg-gray-50 text-xs text-gray-500">
                                        <tr>
                                          <th className="px-3 py-2 font-medium">
                                            Produto
                                          </th>
                                          <th className="px-3 py-2 font-medium">
                                            Qtd.
                                          </th>
                                          <th className="px-3 py-2 font-medium">
                                            Unitário
                                          </th>
                                          <th className="px-3 py-2 font-medium">
                                            Responsabilidade
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody className="divide-y divide-gray-100">
                                        {conta.itens.map((item) => (
                                          <tr key={item.itemPedidoId}>
                                            <td className="px-3 py-2 text-gray-700">
                                              {item.produto}
                                              {item.compartilhado && (
                                                <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                                                  Dividido
                                                </span>
                                              )}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">
                                              {item.quantidade}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">
                                              {formatarMoeda(
                                                item.valorUnitario
                                              )}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                              {formatarMoeda(
                                                item.valorResponsabilidade
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                            {podeRegistrar && saldo > 0 && (
                              <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-end">
                                <div className="flex-1">
                                  <label
                                    htmlFor={`pagamento-${conta.clienteSessaoId}`}
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                  >
                                    Valor do pagamento
                                  </label>

                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                      R$
                                    </span>
                                    <input
                                      id={`pagamento-${conta.clienteSessaoId}`}
                                      type="number"
                                      min="0.01"
                                      max={saldo}
                                      step="0.01"
                                      value={
                                        valoresPagamento[
                                          conta.clienteSessaoId
                                        ] ?? ""
                                      }
                                      onChange={(event) =>
                                        atualizarValorPagamento(
                                          conta.clienteSessaoId,
                                          event.target.value
                                        )
                                      }
                                      placeholder="0,00"
                                      disabled={estaPagando}
                                      className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      atualizarValorPagamento(
                                        conta.clienteSessaoId,
                                        saldo.toFixed(2)
                                      )
                                    }
                                    className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800"
                                  >
                                    Preencher saldo total (
                                    {formatarMoeda(saldo)})
                                  </button>
                                </div>

                                <button
                                  onClick={() => registrarPagamento(conta)}
                                  disabled={
                                    estaPagando ||
                                    pagandoCliente !== null
                                  }
                                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[190px]"
                                >
                                  {estaPagando ? (
                                    <LoaderCircle
                                      size={17}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <CreditCard size={17} />
                                  )}
                                  {estaPagando
                                    ? "Registrando..."
                                    : "Registrar pagamento"}
                                </button>
                              </div>
                            )}

                            {podeRegistrar && pago && (
                              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                                <CheckCircle2 size={18} />
                                Esta conta não possui saldo pendente.
                              </div>
                            )}

                            {!podeRegistrar && (
                              <p className="text-sm text-gray-500">
                                Não é possível registrar pagamentos nesta
                                comanda.
                              </p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <ParticipantesComanda
                comandaId={comandaSelecionada.id}
                podeAutorizar={comandaSelecionada.status === "ABERTA"}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() =>
                  carregarContas(comandaSelecionada.id)
                }
                disabled={carregandoContas}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={carregandoContas ? "animate-spin" : ""}
                />
                Atualizar contas
              </button>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  onClick={() => setComandaSelecionada(null)}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Fechar detalhes
                </button>

                {comandaSelecionada.status === "ABERTA" && (
                  <button
                    onClick={() => encerrarComanda(comandaSelecionada)}
                    disabled={
                      encerrando ||
                      carregandoContas ||
                      contas.length === 0 ||
                      totalPendente > 0
                    }
                    title={
                      contas.length === 0
                        ? "Não há contas individuais carregadas"
                        : totalPendente > 0
                          ? "Existem contas com saldo pendente"
                          : "Encerrar comanda"
                    }
                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {encerrando
                      ? "Encerrando..."
                      : totalPendente > 0
                        ? "Existem pagamentos pendentes"
                        : "Encerrar comanda"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Comandas;