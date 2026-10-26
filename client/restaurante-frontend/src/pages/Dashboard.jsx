import {
  UtensilsCrossed,
  TrendingUp,
  Clock,
  CheckCircle2,
  CircleDollarSign,
} from "lucide-react";

const resumo = [
  {
    titulo: "Mesas ocupadas",
    valor: "—",
    descricao: "Aguardando integração",
    icon: UtensilsCrossed,
    cor: "bg-blue-50 text-blue-600",
  },
  {
    titulo: "Pedidos pendentes",
    valor: "—",
    descricao: "Aguardando integração",
    icon: Clock,
    cor: "bg-amber-50 text-amber-600",
  },
  {
    titulo: "Pedidos concluídos",
    valor: "—",
    descricao: "Aguardando integração",
    icon: CheckCircle2,
    cor: "bg-emerald-50 text-emerald-600",
  },
  {
    titulo: "Vendas do dia",
    valor: "—",
    descricao: "Aguardando integração",
    icon: CircleDollarSign,
    cor: "bg-violet-50 text-violet-600",
  },
];

function Dashboard() {
  return (
    <div>
      <header className="mb-8">
        <p className="text-sm font-medium text-blue-600">
          Visão geral
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Acompanhe o movimento do restaurante.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {resumo.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.titulo}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">
                    {item.titulo}
                  </p>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {item.valor}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${item.cor}`}>
                  <Icon size={22} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {item.descricao}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <TrendingUp size={22} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Visão do restaurante
            </h2>

            <p className="text-sm text-slate-500">
              Os indicadores serão preenchidos com dados reais do backend.
            </p>
          </div>
        </div>

        <div className="mt-6 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="font-medium text-slate-700">
            Painel de indicadores
          </p>

          <p className="mt-2 text-sm text-slate-500">
            A integração com pedidos, mesas e pagamentos será feita nas
            próximas etapas.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;