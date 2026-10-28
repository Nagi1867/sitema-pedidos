import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

function RotaProtegida() {
  const [autenticado, setAutenticado] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      try {
        const resposta = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "same-origin",
        });

        if (!resposta.ok) {
          localStorage.removeItem("adminAutenticado");

          if (ativo) {
            setAutenticado(false);
          }

          return;
        }

        const dados = await resposta.json();

        if (ativo) {
          setAutenticado(dados.autenticado === true);
        }
      } catch {
        if (ativo) {
          setAutenticado(false);
        }
      }
    }

    verificarSessao();

    return () => {
      ativo = false;
    };
  }, []);

  if (autenticado === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Verificando autenticação...</p>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default RotaProtegida;