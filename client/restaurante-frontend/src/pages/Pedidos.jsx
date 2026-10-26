import { useCallback, useEffect, useState } from "react";
import {
  Clock3,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  RefreshCw,
  XCircle,
  UtensilsCrossed,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import { pedidoService } from "../services/api";

const etapas = [
  {
    status: "AGUARDANDO_CONFIRMACAO",
    titulo: "Aguardando",
    descricao: "Novos pedidos",
    icon: Clock3,
    cor: "amber",
  },
  {
    status: "CONFIRMADO",
    titulo: "Confirmados",
    descricao: "Pedidos aceitos",
    icon: CheckCircle2,
    cor: "blue",
  },
  {
    status: "EM_PREPARACAO",
    titulo: "Em preparação",
    descricao: "Na cozinha",
    icon: ChefHat,
    cor: "violet",
  },
  {
    status: "PRONTO",
    titulo: "Prontos",
    descricao: "Aguardando entrega",
    icon: PackageCheck,
    cor: "emerald",
  },
  {
    status: "ENTREGUE",
    titulo: "Entregues",
    descricao: "Pedidos finalizados",
    icon: CheckCircle2,
    cor: "slate",
  },
];

const coresEtapa = {
  AGUARDANDO_CONFIRMACAO: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMADO: "bg-blue-50 text-blue-700 border-blue-200",
  EM_PREPARACAO: "bg-violet-50 text-violet-700 border-violet-200",
  PRONTO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ENTREGUE: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELADO: "bg-red-50 text-red-700 border-red-200",
};

const nomesStatus = {
  AGUARDANDO_CONFIRMACAO: "Aguardando confirmação",
  CONFIRMADO: "Confirmado",
  EM_PREPARACAO: "Em preparação",
  PRONTO: "Pronto",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const proximosStatus = {
  AGUARDANDO_CONFIRMACAO: {
    status: "CONFIRMADO",
    label: "Confirmar pedido",
  },
  CONFIRMADO: {
    status: "EM_PREPARACAO",
    label: "Iniciar preparo",
  },
  EM_PREPARACAO: {
    status: "PRONTO",
    label: "Marcar como pronto",
  },
  PRONTO: {
    status: "ENTREGUE",
    label: "Confirmar entrega",
  },
};

function formatarMoeda(valor) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) return "Data não informada";

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Data não informada";
  }

  return dataFormatada.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obterNumeroMesa(pedido) {
  return (
    pedido?.comanda?.mesa?.numero ??
    pedido?.comanda?.mesaNumero ??
    "—"
  );
}

function obterNomeCliente(pedido) {
  return (
    pedido?.clienteSessao?.nome ??
    pedido?.cliente?.nome ??
    "Cliente não identificado"
  );
}

function obterItens(pedido) {
  return Array.isArray(pedido?.itens) ? pedido.itens : [];
}

function obterTotal(pedido) {
  return obterItens(pedido).reduce((total, item) => {
    const quantidade = Number(item.quantidade ?? 0);
    const preco = Number(
      item.precoUnitario ?? item.produto?.preco ?? 0
    );

    return total + quantidade * preco;
  }, 0);
}

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("AGUARDANDO_CONFIRMACAO");
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [pedidoEmAtualizacao, setPedidoEmAtualizacao] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const carregarPedidos = useCallback(async (mostrarCarregamento = false) => {
    if (mostrarCarregamento) {
      setCarregando(true);
    }

    try {
      const dados = await pedidoService.listar();
      setPedidos(Array.isArray(dados) ? dados : []);
      setErro("");
    } catch (error) {
      setErro(error.message || "Não foi possível carregar os pedidos.");
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarPedidos(true);

    const intervalo = setInterval(() => {
      carregarPedidos();
    }, 5000);

    return () => clearInterval(intervalo);
  }, [carregarPedidos]);

  async function atualizarStatus(pedido, novoStatus) {
    const confirmacoes = {
      CONFIRMADO: "Deseja confirmar este pedido?",
      EM_PREPARACAO: "Deseja iniciar o preparo deste pedido?",
      PRONTO: "Deseja marcar este pedido como pronto?",
      ENTREGUE: "Deseja confirmar a entrega deste pedido?",
      CANCELADO: "Deseja cancelar este pedido?",
    };

    if (!window.confirm(confirmacoes[novoStatus] ?? "Deseja atualizar o pedido?")) {
      return;
    }

    setPedidoEmAtualizacao(pedido.id);
    setErro("");
    setMensagem("");

    try {
      await pedidoService.atualizarStatus(pedido.id, novoStatus);

      setMensagem(
        `Pedido #${pedido.id}: ${nomesStatus[novoStatus].toLowerCase()}.`
      );

      if (pedidoSelecionado?.id === pedido.id) {
        setPedidoSelecionado(null);
      }

      await carregarPedidos();
    } catch (error) {
      setErro(error.message || "Não foi possível atualizar o pedido.");
    } finally {
      setPedidoEmAtualizacao(null);
    }
  }

  const pedidosFiltrados = pedidos
    .filter((pedido) => pedido.status === filtro)
    .sort((a, b) => {
      return new Date(a.dataPedido ?? 0) - new Date(b.dataPedido ?? 0);
    });

  const pedidosAtivos = pedidos.filter(
    (pedido) =>
      !["ENTREGUE", "CANCELADO"].includes(pedido.status)
  );

  const pedidosAguardando = pedidos.filter(
    (pedido) => pedido.status === "AGUARDANDO_CONFIRMACAO"
  ).length;

  const pedidosProntos = pedidos.filter(
    (pedido) => pedido.status === "PRONTO"
  ).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Operação do restaurante
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Pedidos
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Acompanhe os pedidos e atualize cada etapa do atendimento.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAtualizando(true);
            carregarPedidos();
          }}
          disabled={atualizando || carregando}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={atualizando ? "animate-spin" : ""}
          />
          Atualizar pedidos
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
            <p className="text-sm text-slate-500">Pedidos ativos</p>
            <UtensilsCrossed size={21} className="text-blue-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {carregando ? "—" : pedidosAtivos.length}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Pedidos ainda em atendimento
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Aguardando confirmação</p>
            <Clock3 size={21} className="text-amber-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {carregando ? "—" : pedidosAguardando}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Precisam da atenção da equipe
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Pedidos prontos</p>
            <PackageCheck size={21} className="text-emerald-600" />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {carregando ? "—" : pedidosProntos}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Aguardando entrega ao cliente
          </p>
        </article>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-lg font-bold text-slate-900">
            Etapas dos pedidos
          </h2>

          <p className="text-sm text-slate-500">
            Selecione uma etapa para visualizar seus pedidos.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {etapas.map((etapa) => {
            const Icon = etapa.icon;
            const quantidade = pedidos.filter(
              (pedido) => pedido.status === etapa.status
            ).length;
            const selecionada = filtro === etapa.status;

            return (
              <button
                key={etapa.status}
                type="button"
                onClick={() => setFiltro(etapa.status)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selecionada
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-lg p-2 ${
                      selecionada
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={19} />
                  </span>

                  <span className="text-2xl font-bold text-slate-900">
                    {carregando ? "—" : quantidade}
                  </span>
                </div>

                <p className="mt-3 font-semibold text-slate-900">
                  {etapa.titulo}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {etapa.descricao}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {etapas.find((etapa) => etapa.status === filtro)?.titulo}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {pedidosFiltrados.length}{" "}
              {pedidosFiltrados.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
            </p>
          </div>

          <span
            className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
              coresEtapa[filtro]
            }`}
          >
            {nomesStatus[filtro]}
          </span>
        </div>

        {carregando ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw size={25} className="animate-spin text-blue-600" />
            <p className="text-sm">Carregando pedidos...</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
              <UtensilsCrossed size={28} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              Nenhum pedido nesta etapa
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Quando houver pedidos nesta etapa, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pedidosFiltrados.map((pedido) => {
              const itens = obterItens(pedido);
              const proximo = proximosStatus[pedido.status];

              return (
                <article
                  key={pedido.id}
                  className="p-5 transition hover:bg-slate-50/70"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          Pedido #{pedido.id}
                        </h3>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            coresEtapa[pedido.status] ??
                            "border-slate-200 bg-slate-100 text-slate-700"
                          }`}
                        >
                          {nomesStatus[pedido.status] ?? pedido.status}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                        <span>Mesa {obterNumeroMesa(pedido)}</span>
                        <span>{obterNomeCliente(pedido)}</span>
                        <span>{formatarData(pedido.dataPedido)}</span>
                      </div>

                      <div className="mt-4 space-y-2">
                        {itens.length > 0 ? (
                          itens.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-wrap items-center justify-between gap-2 text-sm"
                            >
                              <span className="text-slate-700">
                                <span className="mr-2 font-semibold text-slate-900">
                                  {item.quantidade}x
                                </span>
                                {item.produto?.nome ?? "Produto"}
                              </span>

                              <span className="text-slate-500">
                                {formatarMoeda(
                                  Number(item.precoUnitario ?? item.produto?.preco ?? 0) *
                                    Number(item.quantidade ?? 0)
                                )}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">
                            Os itens deste pedido não foram retornados pela API.
                          </p>
                        )}
                      </div>

                      {pedido.observacao && (
                        <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                          <span className="font-semibold">Observação: </span>
                          {pedido.observacao}
                        </div>
                      )}

                      <p className="mt-4 text-base font-bold text-slate-900">
                        Total: {formatarMoeda(obterTotal(pedido))}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:max-w-56 xl:justify-end">
                      <button
                        type="button"
                        onClick={() => setPedidoSelecionado(pedido)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <Eye size={17} />
                        Detalhes
                      </button>

                      {proximo && (
                        <button
                          type="button"
                          disabled={pedidoEmAtualizacao === pedido.id}
                          onClick={() =>
                            atualizarStatus(pedido, proximo.status)
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {pedidoEmAtualizacao === pedido.id ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}

                          {proximo.label}
                        </button>
                      )}

                      {pedido.status === "AGUARDANDO_CONFIRMACAO" && (
                        <button
                          type="button"
                          disabled={pedidoEmAtualizacao === pedido.id}
                          onClick={() =>
                            atualizarStatus(pedido, "CANCELADO")
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle size={16} />
                          Recusar
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {pedidoSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setPedidoSelecionado(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pedido-detalhes-titulo"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-sm text-blue-600">Detalhes do pedido</p>

                <h2
                  id="pedido-detalhes-titulo"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  Pedido #{pedidoSelecionado.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setPedidoSelecionado(null)}
                aria-label="Fechar detalhes"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Mesa</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {obterNumeroMesa(pedidoSelecionado)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Cliente</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {obterNomeCliente(pedidoSelecionado)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Data do pedido</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatarData(pedidoSelecionado.dataPedido)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {nomesStatus[pedidoSelecionado.status] ??
                      pedidoSelecionado.status}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">Itens do pedido</h3>

                <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
                  {obterItens(pedidoSelecionado).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.quantidade}x {item.produto?.nome ?? "Produto"}
                        </p>

                        {item.observacao && (
                          <p className="mt-1 text-xs text-slate-500">
                            {item.observacao}
                          </p>
                        )}
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-slate-700">
                        {formatarMoeda(
                          Number(item.precoUnitario ?? item.produto?.preco ?? 0) *
                            Number(item.quantidade ?? 0)
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {pedidoSelecionado.observacao && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Observação do cliente
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    {pedidoSelecionado.observacao}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-semibold text-slate-700">Total</span>

                <span className="text-xl font-bold text-slate-900">
                  {formatarMoeda(obterTotal(pedidoSelecionado))}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setPedidoSelecionado(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pedidos;