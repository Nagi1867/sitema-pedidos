import { Navigate, Route, Routes } from "react-router-dom";
import Mesas from "../pages/Mesas";
import Produtos from "../pages/Produtos";
import Dashboard from "../pages/Dashboard";
import ComandaCliente from "../pages/ComandaCliente";
import Comandas from "../pages/Comandas";
import Pedidos from "../pages/Pedidos";
import Clientes from "../pages/Clientes";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route path="/mesas" element={<Mesas />} />

      <Route
        path="/comanda/:codigoAcesso"
        element={<ComandaCliente />}
      />

      <Route path="/comandas" element={<Comandas />} />

      <Route path="/produtos" element={<Produtos />} />
      <Route path="/pedidos" element={<Pedidos />} />

      <Route path="/clientes" element={<Clientes />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;