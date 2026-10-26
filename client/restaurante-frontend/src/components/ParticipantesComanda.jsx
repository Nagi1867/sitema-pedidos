import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Users,
} from "lucide-react";
import { sessaoService } from "../services/api";

function formatarData(data) {
  if (!data) {
    return "Data não informada";
  }

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Data não informada";
  }

  return dataFormatada.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function ParticipantesComanda({ comandaId, podeAutorizar = true }) {
  const [participantes, setParticipantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [alterandoId, setAlterandoId] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const carregarParticipantes = useCallback(
    async (silencioso = false) => {
      if (silencioso) {
        setAtualizando(true);
      } else {
        setCarregando(true);
      }

      try {
        const dados = await sessaoService.listarPorComanda(comandaId);

        setParticipantes(Array.isArray(dados) ? dados : []);
        setErro("");
      } catch (error) {
        setErro(
          error.message || "Não foi possível carregar os participantes."
        );
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [comandaId]
  );

  useEffect(() => {
    carregarParticipantes();

    const intervalo = window.setInterval(() => {
      carregarParticipantes(true);
    }, 5000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [carregarParticipantes]);

  async function alterarAutorizacao(participante) {
    const novoStatus = !participante.autorizado;

    setAlterandoId(participante.id);
    setErro("");
    setMensagem("");

    try {
      await sessaoService.alterarAutorizacao(
        participante.id,
        novoStatus
      );

      setParticipantes((atuais) =>
        atuais.map((item) =>
          item.id === participante.id
            ? { ...item, autorizado: novoStatus }
            : item
        )
      );

      setMensagem(
        novoStatus
          ? `Acesso de ${participante.nome} autorizado.`
          : `Acesso de ${participante.nome} revogado.`
      );
    } catch (error) {
      setErro(
        error.message || "Não foi possível alterar a autorização."
      );
    } finally {
      setAlterandoId(null);
    }
  }

  const aguardando = participantes.filter(
    (participante) => !participante.autorizado
  ).length;

  const autorizados = participantes.filter(
    (participante) => participante.autorizado
  ).length;

  return (
    <section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-blue-600" />

            <h3 className="text-lg font-semibold text-gray-900">
              Participantes
            </h3>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Autorize os clientes antes que enviem pedidos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => carregarParticipantes(true)}
          disabled={atualizando || carregando}
          className="flex items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            size={15}
            className={atualizando ? "animate-spin" : ""}
          />
          Atualizar
        </button>
      </div>

      {!carregando && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock size={17} />
              <span className="text-sm font-medium">Aguardando</span>
            </div>

            <p className="mt-2 text-2xl font-bold text-amber-800">
              {aguardando}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={17} />
              <span className="text-sm font-medium">Autorizados</span>
            </div>

            <p className="mt-2 text-2xl font-bold text-emerald-800">
              {autorizados}
            </p>
          </div>
        </div>
      )}

      {erro && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {mensagem}
        </div>
      )}

      {carregando ? (
        <div className="flex items-center justify-center gap-3 py-8 text-gray-500">
          <LoaderCircle size={22} className="animate-spin text-blue-600" />
          <span className="text-sm">Carregando participantes...</span>
        </div>
      ) : participantes.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <Users size={28} className="mx-auto text-gray-400" />

          <p className="mt-3 font-medium text-gray-700">
            Nenhum participante ainda
          </p>

          <p className="mt-1 text-sm text-gray-500">
            As solicitações dos clientes aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {participantes.map((participante) => {
            const autorizado = Boolean(participante.autorizado);
            const alterando = alterandoId === participante.id;

            return (
              <article
                key={participante.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {participante.nome || "Cliente sem nome"}
                    </h4>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        autorizado
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {autorizado ? "Autorizado" : "Aguardando"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Solicitação: {formatarData(participante.dataEntrada)}
                  </p>
                </div>

                {podeAutorizar ? (
                  <button
                    type="button"
                    onClick={() => alterarAutorizacao(participante)}
                    disabled={alterandoId !== null}
                    className={`flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      autorizado
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {alterando ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : autorizado ? (
                      <ShieldX size={16} />
                    ) : (
                      <ShieldCheck size={16} />
                    )}

                    {alterando
                      ? "Salvando..."
                      : autorizado
                        ? "Revogar acesso"
                        : "Autorizar"}
                  </button>
                ) : (
                  <span className="text-xs text-gray-500">
                    Comanda não está aberta
                  </span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ParticipantesComanda;