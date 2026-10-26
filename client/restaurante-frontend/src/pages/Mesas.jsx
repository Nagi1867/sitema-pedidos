import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Plus,
  RefreshCw,
  Utensils,
  CheckCircle2,
  XCircle,
  QrCode,
  Power,
  X,
  LoaderCircle,
} from "lucide-react";
import { mesaService } from "../services/api";

function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [numero, setNumero] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [operacaoMesa, setOperacaoMesa] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [comanda, setComanda] = useState(null);

  async function carregarMesas() {
    setCarregando(true);
    setErro("");

    try {
      const dados = await mesaService.listar();
      setMesas(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMesas();
  }, []);

  async function cadastrarMesa(event) {
    event.preventDefault();

    const numeroMesa = Number(numero);

    if (!Number.isInteger(numeroMesa) || numeroMesa <= 0) {
      setErro("Informe um número de mesa válido.");
      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      await mesaService.cadastrar(numeroMesa);

      setNumero("");
      setSucesso("Mesa cadastrada com sucesso.");

      await carregarMesas();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alterarAtividade(mesa) {
    setOperacaoMesa(mesa.id);
    setErro("");
    setSucesso("");

    try {
      await mesaService.alterarAtividade(mesa.id, !mesa.ativa);

      setSucesso(
        `Mesa ${mesa.numero} ${
          mesa.ativa ? "desativada" : "ativada"
        } com sucesso.`
      );

      await carregarMesas();
    } catch (error) {
      setErro(error.message);
    } finally {
      setOperacaoMesa(null);
    }
  }

  async function abrirComanda(mesa) {
    setOperacaoMesa(mesa.id);
    setErro("");
    setSucesso("");

    try {
      const novaComanda = await mesaService.abrirComanda(mesa.id);

      if (!novaComanda.codigoAcesso) {
        throw new Error(
          "A comanda foi aberta, mas a API não retornou o código de acesso."
        );
      }

      setComanda({
        ...novaComanda,
        numeroMesa: mesa.numero,
      });

      setSucesso(`Comanda da mesa ${mesa.numero} aberta com sucesso.`);
    } catch (error) {
      setErro(error.message);
    } finally {
      setOperacaoMesa(null);
    }
  }

  const mesasAtivas = mesas.filter((mesa) => mesa.ativa).length;
  const mesasInativas = mesas.length - mesasAtivas;

  const enderecoComanda = comanda
    ? `${window.location.origin}/comanda/${comanda.codigoAcesso}`
    : "";

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Gerenciamento
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Mesas
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Cadastre mesas e gerencie as comandas do restaurante.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarMesas}
          disabled={carregando}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={carregando ? "animate-spin" : ""}
          />
          Atualizar
        </button>
      </header>

      {erro && (
        <div
          role="alert"
          className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{erro}</span>

          <button
            type="button"
            onClick={() => setErro("")}
            aria-label="Fechar mensagem de erro"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {sucesso && (
        <div
          role="status"
          className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <span>{sucesso}</span>

          <button
            type="button"
            onClick={() => setSucesso("")}
            aria-label="Fechar mensagem de sucesso"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <ResumoCard
          titulo="Total de mesas"
          valor={mesas.length}
          descricao="Mesas cadastradas"
          icon={Utensils}
          cor="bg-blue-50 text-blue-600"
        />

        <ResumoCard
          titulo="Mesas ativas"
          valor={mesasAtivas}
          descricao="Disponíveis para atendimento"
          icon={CheckCircle2}
          cor="bg-emerald-50 text-emerald-600"
        />

        <ResumoCard
          titulo="Mesas inativas"
          valor={mesasInativas}
          descricao="Indisponíveis para atendimento"
          icon={XCircle}
          cor="bg-slate-100 text-slate-600"
        />
      </section>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Cadastrar mesa
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Informe o número da nova mesa.
          </p>
        </div>

        <form
          onSubmit={cadastrarMesa}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="number"
            min="1"
            step="1"
            value={numero}
            onChange={(event) => setNumero(event.target.value)}
            placeholder="Número da mesa"
            required
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={salvando}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {salvando ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}

            {salvando ? "Cadastrando..." : "Adicionar mesa"}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Mesas cadastradas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Gerencie a disponibilidade e abra novas comandas.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {mesas.length} {mesas.length === 1 ? "mesa" : "mesas"}
          </span>
        </div>

        {carregando ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <LoaderCircle
              size={28}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : mesas.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <Utensils size={36} className="text-slate-400" />

            <h3 className="mt-4 font-semibold text-slate-800">
              Nenhuma mesa cadastrada
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Cadastre sua primeira mesa utilizando o formulário acima.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mesas
              .slice()
              .sort((a, b) => a.numero - b.numero)
              .map((mesa) => (
                <article
                  key={mesa.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Utensils size={23} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Mesa {mesa.numero}
                        </h3>

                        <p className="text-xs text-slate-500">
                          Identificação: {mesa.id}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        mesa.ativa
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {mesa.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => alterarAtividade(mesa)}
                      disabled={operacaoMesa === mesa.id}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      {operacaoMesa === mesa.id ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Power size={17} />
                      )}

                      {mesa.ativa ? "Desativar mesa" : "Ativar mesa"}
                    </button>

                    <button
                      type="button"
                      onClick={() => abrirComanda(mesa)}
                      disabled={
                        !mesa.ativa || operacaoMesa === mesa.id
                      }
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {operacaoMesa === mesa.id ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <QrCode size={17} />
                      )}

                      Abrir comanda
                    </button>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>

      {comanda && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setComanda(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-titulo"
            className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="qr-titulo"
                  className="text-xl font-bold text-slate-900"
                >
                  Comanda aberta
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Mesa {comanda.numeroMesa}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setComanda(null)}
                aria-label="Fechar QR Code"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 flex justify-center rounded-2xl border border-slate-200 bg-white p-6">
              <QRCodeSVG
                value={enderecoComanda}
                size={240}
                level="H"
                marginSize={2}
                title={`QR Code da comanda da mesa ${comanda.numeroMesa}`}
              />
            </div>

            <p className="mt-4 text-center text-sm text-slate-600">
              Escaneie o código para acessar o endereço da comanda.
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Código de acesso
              </p>

              <p className="mt-2 break-all font-mono text-sm text-slate-800">
                {comanda.codigoAcesso}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Imprimir QR Code
            </button>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              O QR Code contém o endereço do frontend. A página de acesso
              à comanda será implementada em uma próxima etapa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumoCard({ titulo, valor, descricao, icon: Icon, cor }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{titulo}</p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {valor}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${cor}`}>
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">{descricao}</p>
    </article>
  );
}

export default Mesas;