import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Package,
  Settings,
  Users,
  ChefHat,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Mesas", icon: UtensilsCrossed, path: "/mesas" },
  { label: "Comandas", icon: ClipboardList, path: "/comandas" },
  { label: "Produtos", icon: Package, path: "/produtos" },
  { label: "Clientes", icon: Users, path: "/clientes" },
  { label: "Pedidos", icon: ChefHat, path: "/pedidos" },
];

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  if (
    location.pathname.startsWith("/comanda/") ||
    location.pathname === "/login"
  ) {
    return <AppRoutes />;
  }

  async function handleLogout() {
    try {
      const resposta = await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível encerrar a sessão.");
      }
    } catch (error) {
      alert(error.message || "Erro ao realizar logout.");
      return;
    }

    localStorage.removeItem("adminAutenticado");
    navigate("/login", { replace: true });
  }

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

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            <span>Sair</span>
          </button>

          <div className="mt-3 hidden px-1 md:block">
            <p className="text-xs text-slate-500">
              Sistema de comandas
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Ambiente de desenvolvimento
            </p>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;