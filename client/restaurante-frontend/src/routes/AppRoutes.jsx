import { Navigate, Route, Routes } from "react-router-dom";
import Mesas from "../pages/Mesas";
import Produtos from "../pages/Produtos";
import Dashboard from "../pages/Dashboard";
import ComandaCliente from "../pages/ComandaCliente";
import Comandas from "../pages/Comandas";
import Pedidos from "../pages/Pedidos";
import Clientes from "../pages/Clientes";
import RotaProtegida from "../components/RotaProtegida";
import Login from "../pages/Login";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/comanda/:codigoAcesso"
        element={<ComandaCliente />}
      />

      <Route element={<RotaProtegida />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mesas" element={<Mesas />} />
        <Route path="/comandas" element={<Comandas />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/clientes" element={<Clientes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;