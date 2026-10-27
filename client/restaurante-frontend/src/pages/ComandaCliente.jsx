import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { comandaClienteService } from "../services/api";

const formatarMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor) || 0);

function ComandaCliente() {
  const { codigoAcesso } = useParams();

  const [comanda, setComanda] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [sessao, setSessao] = useState(null);
  const [nome, setNome] = useState("");
  const [carrinho, setCarrinho] = useState({});
  const [observacao, setObservacao] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const chaveSessao = `comanda-sessao-${codigoAcesso}`;

  const carregarPedidos = useCallback(async (comandaId) => {
    try {
      const resultado =
        await comandaClienteService.listarPedidos(comandaId);

      setPedidos(Array.isArray(resultado) ? resultado : []);
    } catch {
      setPedidos([]);
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarPagina() {
      setCarregando(true);
      setErro("");

      try {
        const [dadosComanda, dadosProdutos] = await Promise.all([
          comandaClienteService.buscarPorCodigo(codigoAcesso),
          comandaClienteService.listarProdutos(),
        ]);

        if (!ativo) return;

        setComanda(dadosComanda);
        setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);

        const tokenSalvo = localStorage.getItem(chaveSessao);

        if (tokenSalvo) {
          try {
            const dadosSessao =
              await comandaClienteService.buscarSessao(tokenSalvo);

            if (!ativo) return;

            if (dadosSessao.comanda?.id === dadosComanda.id) {
              setSessao(dadosSessao);
              setNome(dadosSessao.nome || "");
            } else {
              localStorage.removeItem(chaveSessao);
            }
          } catch {
            localStorage.removeItem(chaveSessao);
          }
        }

        await carregarPedidos(dadosComanda.id);
      } catch (error) {
        if (ativo) {
          setErro(
            error.message ||
              "Não foi possível carregar a comanda. Verifique o QR Code."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarPagina();

    return () => {
      ativo = false;
    };
  }, [codigoAcesso, chaveSessao, carregarPedidos]);

  useEffect(() => {
    if (!sessao?.tokenAcesso) return;

    let ativo = true;

    const verificarSessao = async () => {
      try {
        const dadosSessao =
          await comandaClienteService.buscarSessao(sessao.tokenAcesso);

        if (!ativo) return;

        setSessao(dadosSessao);
      } catch {
        if (ativo) {
          setErro("Não foi possível verificar sua sessão.");
        }
      }
    };

    const intervalo = window.setInterval(verificarSessao, 5000);

    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, [sessao?.tokenAcesso]);

  useEffect(() => {
    if (comanda?.id) {
      carregarPedidos(comanda.id);
    }
  }, [comanda?.id, carregarPedidos]);

  const alterarQuantidade = (produtoId, variacao) => {
    setCarrinho((atual) => {
      const quantidadeAtual = atual[produtoId] || 0;
      const novaQuantidade = quantidadeAtual + variacao;

      if (novaQuantidade <= 0) {
        const novoCarrinho = { ...atual };
        delete novoCarrinho[produtoId];
        return novoCarrinho;
      }

      return {
        ...atual,
        [produtoId]: novaQuantidade,
      };
    });
  };

  const totalItens = Object.values(carrinho).reduce(
    (total, quantidade) => total + quantidade,
    0
  );

  const totalCarrinho = produtos.reduce((total, produto) => {
    const quantidade = carrinho[produto.id] || 0;
    return total + Number(produto.preco) * quantidade;
  }, 0);

  const entrarNaComanda = async (evento) => {
    evento.preventDefault();
    setErro("");
    setMensagem("");

    if (!nome.trim()) {
      setErro("Informe seu nome para continuar.");
      return;
    }

    try {
      const novaSessao = await comandaClienteService.entrar(
        comanda.id,
        nome.trim()
      );

      setSessao(novaSessao);
      localStorage.setItem(chaveSessao, novaSessao.tokenAcesso);
      setMensagem("Você entrou na comanda e já pode fazer seus pedidos.");
    } catch (error) {
      setErro(error.message || "Não foi possível entrar na comanda.");
    }
  };

  const enviarPedido = async () => {
    if (!sessao?.id) {
      setErro("Informe seu nome para entrar na comanda antes de pedir.");
      return;
    }

    if (totalItens === 0) {
      setErro("Adicione pelo menos um produto ao pedido.");
      return;
    }

    setEnviando(true);
    setErro("");
    setMensagem("");

    try {
      const produtosPedido = Object.fromEntries(
        Object.entries(carrinho).map(([id, quantidade]) => [
          String(id),
          quantidade,
        ])
      );

      await comandaClienteService.criarPedido(
        sessao.id,
        produtosPedido,
        observacao.trim()
      );

      setCarrinho({});
      setObservacao("");
      setMensagem("Pedido enviado com sucesso!");
      await carregarPedidos(comanda.id);
    } catch (error) {
      setErro(error.message || "Não foi possível enviar seu pedido.");
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <p className="text-slate-500">Carregando comanda...</p>
      </div>
    );
  }

  if (erro && !comanda) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <UtensilsCrossed className="mx-auto text-blue-600" size={36} />
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Comanda indisponível
          </h1>
          <p className="mt-2 text-sm text-slate-500">{erro}</p>
        </div>
      </div>
    );
  }

  const statusPedido = {
    AGUARDANDO_CONFIRMACAO: "Aguardando confirmação",
    CONFIRMADO: "Confirmado",
    EM_PREPARACAO: "Em preparação",
    PRONTO: "Pronto",
    ENTREGUE: "Entregue",
    CANCELADO: "Cancelado",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-950 px-5 py-6 text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-3">
            <UtensilsCrossed size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold">Cardápio</h1>
            <p className="text-sm text-slate-400">
              Comanda #{comanda?.id}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-4 py-6 sm:p-6">
        {!sessao && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Entre na sua comanda
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Informe seu nome para identificar seus pedidos nesta mesa.
            </p>

            <form
              onSubmit={entrarNaComanda}
              className="mt-4 flex flex-col gap-3 sm:flex-row"
            >
              <input
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                maxLength={80}
                placeholder="Seu nome"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                required
              />

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Entrar na comanda
              </button>
            </form>
          </section>
        )}

        {sessao && (
          <section className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="mt-1 text-emerald-600" size={24} />

            <div>
              <h2 className="font-bold text-slate-900">
                Olá, {sessao.nome}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Você já pode escolher produtos e enviar seus pedidos.
              </p>
            </div>
          </section>
        )}

        {erro && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {mensagem}
          </div>
        )}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Nosso cardápio</h2>
            <p className="mt-1 text-sm text-slate-500">
              Escolha os produtos que deseja pedir.
            </p>
          </div>

          {produtos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              Nenhum produto disponível no momento.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {produtos.map((produto) => (
                <article
                  key={produto.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">
                      {produto.nome}
                    </h3>

                    {produto.descricao && (
                      <p className="mt-2 text-sm text-slate-500">
                        {produto.descricao}
                      </p>
                    )}

                    <p className="mt-4 text-lg font-bold text-blue-600">
                      {formatarMoeda(produto.preco)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm text-slate-500">Quantidade</span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(produto.id, -1)}
                        disabled={!carrinho[produto.id]}
                        className="rounded-lg border border-slate-200 p-2 text-slate-700 disabled:opacity-30"
                        aria-label={`Remover ${produto.nome}`}
                      >
                        <Minus size={16} />
                      </button>

                      <span className="w-5 text-center font-semibold">
                        {carrinho[produto.id] || 0}
                      </span>

                      <button
                        type="button"
                        onClick={() => alterarQuantidade(produto.id, 1)}
                        className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                        aria-label={`Adicionar ${produto.nome}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-slate-900">Seu pedido</h2>
          </div>

          {totalItens === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Você ainda não adicionou produtos.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {produtos
                .filter((produto) => carrinho[produto.id])
                .map((produto) => (
                  <div
                    key={produto.id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-slate-600">
                      {carrinho[produto.id]}x {produto.nome}
                    </span>

                    <span className="font-semibold text-slate-900">
                      {formatarMoeda(
                        Number(produto.preco) * carrinho[produto.id]
                      )}
                    </span>
                  </div>
                ))}

              <div className="border-t border-slate-200 pt-3">
                <label
                  htmlFor="observacao"
                  className="text-sm font-medium text-slate-700"
                >
                  Observações do pedido
                </label>

                <textarea
                  id="observacao"
                  value={observacao}
                  onChange={(evento) => setObservacao(evento.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Ex.: retirar algum ingrediente..."
                  className="mt-2 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatarMoeda(totalCarrinho)}
                </span>
              </div>

              <button
                type="button"
                onClick={enviarPedido}
                disabled={!sessao?.id || enviando}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {!sessao?.id
                  ? "Entre na comanda para pedir"
                  : enviando
                    ? "Enviando pedido..."
                    : "Enviar pedido"}
              </button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Pedidos da comanda
          </h2>

          {pedidos.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Ainda não há pedidos registrados nesta comanda.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {pedidos.map((pedido) => (
                <article
                  key={pedido.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">
                      Pedido #{pedido.id}
                    </h3>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {statusPedido[pedido.status] || pedido.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {pedido.dataPedido
                      ? new Date(pedido.dataPedido).toLocaleString("pt-BR")
                      : ""}
                  </p>

                  {pedido.clienteSessao?.nome && (
                    <p className="mt-2 text-sm text-slate-600">
                      Pedido feito por: {pedido.clienteSessao.nome}
                    </p>
                  )}

                  {pedido.observacao && (
                    <p className="mt-2 text-sm text-slate-600">
                      {pedido.observacao}
                    </p>
                  )}

                  <div className="mt-3 space-y-2">
                    {pedido.itens?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-3 text-sm"
                      >
                        <span className="text-slate-600">
                          {item.quantidade}x {item.produto?.nome || "Produto"}
                        </span>

                        <span className="text-slate-700">
                          {formatarMoeda(
                            Number(item.precoUnitario) * Number(item.quantidade)
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ComandaCliente;