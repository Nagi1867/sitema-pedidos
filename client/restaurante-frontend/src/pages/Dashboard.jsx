import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Clock,
  ChefHat,
  CheckCircle2,
  ClipboardList,
  UtensilsCrossed,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

const API_URL = "/api";

const configuracoes = [
  {
    titulo: "Pedidos aguardando confirmação",
    descricao: "Pedidos que precisam ser confirmados.",
    status: "AGUARDANDO_CONFIRMACAO",
    icon: Clock,
    cor: "bg-amber-50 text-amber-600",
    rota: "/pedidos",
  },
  {
    titulo: "Pedidos em preparação",
    descricao: "Pedidos que estão sendo preparados.",
    status: "EM_PREPARACAO",
    icon: ChefHat,
    cor: "bg-blue-50 text-blue-600",
    rota: "/pedidos",
  },
  {
    titulo: "Pedidos prontos",
    descricao: "Pedidos que aguardam entrega.",
    status: "PRONTO",
    icon: CheckCircle2,
    cor: "bg-emerald-50 text-emerald-600",
    rota: "/pedidos",
  },
];

function Dashboard() {
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregarDados = useCallback(async () => {
    try {
      const [resPedidos, resComandas, resMesas] = await Promise.all([
        fetch(`${API_URL}/pedidos`),
        fetch(`${API_URL}/comandas`),
        fetch(`${API_URL}/mesas`),
      ]);

      if (!resPedidos.ok || !resComandas.ok || !resMesas.ok) {
        throw new Error("Não foi possível carregar todos os dados do restaurante.");
      }

      const [dadosPedidos, dadosComandas, dadosMesas] = await Promise.all([
        resPedidos.json(),
        resComandas.json(),
        resMesas.json(),
      ]);

      setPedidos(dadosPedidos);
      setComandas(dadosComandas);
      setMesas(dadosMesas);
      setErro("");
    } catch (error) {
      setErro(error.message || "Erro ao carregar as notificações.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();

    const intervalo = setInterval(carregarDados, 30000);

    return () => clearInterval(intervalo);
  }, [carregarDados]);

  const contarPedidos = (status) =>
    pedidos.filter((pedido) => pedido.status === status).length;

  const comandasAbertas = comandas.filter(
    (comanda) => comanda.status === "ABERTA",
  ).length;

  const mesasInativas = mesas.filter((mesa) => mesa.ativa === false).length;

  const notificacoesPedidos = configuracoes.map((config) => ({
    ...config,
    quantidade: contarPedidos(config.status),
  }));

  const notificacoes = [
    ...notificacoesPedidos,
    {
      titulo: "Comandas abertas",
      descricao: "Comandas que continuam em atendimento.",
      quantidade: comandasAbertas,
      icon: ClipboardList,
      cor: "bg-violet-50 text-violet-600",
      rota: "/comandas",
    },
    {
      titulo: "Mesas inativas",
      descricao: "Mesas desativadas no sistema.",
      quantidade: mesasInativas,
      icon: UtensilsCrossed,
      cor: "bg-rose-50 text-rose-600",
      rota: "/mesas",
    },
  ];

  const totalPendencias = notificacoes.reduce(
    (total, notificacao) => total + notificacao.quantidade,
    0,
  );

  return (
    <div>
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Central de notificações
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Acompanhe as atividades que precisam de atenção no restaurante.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarDados}
          disabled={carregando}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={carregando ? "animate-spin" : ""} />
          Atualizar
        </button>
      </header>

      {erro && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">Não foi possível atualizar o Dashboard</p>
            <p className="mt-1 text-sm">{erro}</p>

            <button
              type="button"
              onClick={carregarDados}
              className="mt-2 text-sm font-semibold underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Pendências identificadas</p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {carregando ? "—" : totalPendencias}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Bell size={22} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Soma das notificações exibidas abaixo.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Pedidos aguardando confirmação
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {carregando
                  ? "—"
                  : contarPedidos("AGUARDANDO_CONFIRMACAO")}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock size={22} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Pedidos que precisam de confirmação.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Comandas abertas</p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {carregando ? "—" : comandasAbertas}
              </p>
            </div>

            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <ClipboardList size={22} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Comandas em atendimento.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Mesas inativas</p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {carregando ? "—" : mesasInativas}
              </p>
            </div>

            <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
              <UtensilsCrossed size={22} />
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Mesas desativadas no sistema.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Notificações do restaurante
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Acesse diretamente as áreas que precisam de atenção.
          </p>
        </div>

        {carregando && pedidos.length === 0 && comandas.length === 0 && mesas.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-slate-500">
            Carregando notificações...
          </div>
        ) : (
          <div className="space-y-3">
            {notificacoes.map((notificacao) => {
              const Icon = notificacao.icon;

              return (
                <article
                  key={notificacao.titulo}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-3 ${notificacao.cor}`}>
                      <Icon size={21} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {notificacao.titulo}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {notificacao.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span
                      className={`min-w-10 rounded-full px-3 py-1 text-center text-sm font-bold ${
                        notificacao.quantidade > 0
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {carregando ? "—" : notificacao.quantidade}
                    </span>

                    <button
                      type="button"
                      onClick={() => navigate(notificacao.rota)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Acessar
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!carregando && !erro && totalPendencias === 0 && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            Não há pendências nas categorias monitoradas no momento.
          </div>
        )}

        <p className="mt-5 text-xs text-slate-400">
          Os dados são atualizados automaticamente a cada 30 segundos.
        </p>
      </section>
    </div>
  );
}

export default Dashboard;