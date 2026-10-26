import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Package,
  Settings,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  CircleDollarSign,
} from "lucide-react";
import Mesas from "./pages/Mesas";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Mesas", icon: UtensilsCrossed, path: "/mesas" },
  { label: "Comandas", icon: ClipboardList, path: "/comandas" },
  { label: "Produtos", icon: Package, path: "/produtos" },
  { label: "Clientes", icon: Users, path: "/clientes" },
  { label: "Configurações", icon: Settings, path: "/configuracoes" },
];

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

function PaginaEmDesenvolvimento({ titulo }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      <h1 className="text-2xl font-bold text-slate-900">{titulo}</h1>

      <p className="mt-2 text-sm text-slate-500">
        Esta página será implementada em uma próxima etapa.
      </p>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="flex w-full flex-col bg-slate-950 text-white md:min-h-screen md:w-64 md:shrink-0">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <UtensilsCrossed size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold">Restaurante</h2>

              <p className="text-xs text-slate-400">
                Sistema de gestão
              </p>
            </div>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-4 md:flex-1 md:flex-col">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-blue-600 font-semibold text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden border-t border-white/10 p-5 md:block">
          <p className="text-xs text-slate-500">
            Sistema de comandas
          </p>

          <p className="mt-1 text-sm text-slate-300">
            Ambiente de desenvolvimento
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mesas" element={<Mesas />} />

          <Route
            path="/comandas"
            element={<PaginaEmDesenvolvimento titulo="Comandas" />}
          />

          <Route
            path="/produtos"
            element={<PaginaEmDesenvolvimento titulo="Produtos" />}
          />

          <Route
            path="/clientes"
            element={<PaginaEmDesenvolvimento titulo="Clientes" />}
          />

          <Route
            path="/configuracoes"
            element={<PaginaEmDesenvolvimento titulo="Configurações" />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;