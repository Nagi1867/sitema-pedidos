import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Power,
  X,
  LoaderCircle,
  Save,
} from "lucide-react";
import { produtoService } from "../services/api";

const produtoInicial = {
  nome: "",
  descricao: "",
  preco: "",
  categoria: "",
};

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [formulario, setFormulario] = useState(produtoInicial);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [operacaoId, setOperacaoId] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregarProdutos() {
    setCarregando(true);
    setErro("");

    try {
      const dados = await produtoService.listar();
      setProdutos(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  function abrirCadastro() {
    setProdutoEditando(null);
    setFormulario(produtoInicial);
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEdicao(produto) {
    setProdutoEditando(produto);

    setFormulario({
      nome: produto.nome ?? "",
      descricao: produto.descricao ?? "",
      preco: String(produto.preco ?? ""),
      categoria: produto.categoria ?? "",
    });

    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function atualizarCampo(event) {
    const { name, value } = event.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  async function salvarProduto(event) {
    event.preventDefault();

    const preco = Number(
      formulario.preco.replace(",", ".")
    );

    if (!formulario.nome.trim()) {
      setErro("Informe o nome do produto.");
      return;
    }

    if (!formulario.categoria.trim()) {
      setErro("Informe a categoria do produto.");
      return;
    }

    if (!Number.isFinite(preco) || preco <= 0) {
      setErro("Informe um preço válido, maior que zero.");
      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");

    const produto = {
      nome: formulario.nome.trim(),
      descricao: formulario.descricao.trim(),
      preco,
      categoria: formulario.categoria.trim(),
    };

    try {
      if (produtoEditando) {
        await produtoService.atualizar(produtoEditando.id, produto);
        setSucesso("Produto atualizado com sucesso.");
      } else {
        await produtoService.cadastrar(produto);
        setSucesso("Produto cadastrado com sucesso.");
      }

      setModalAberto(false);
      setFormulario(produtoInicial);
      setProdutoEditando(null);

      await carregarProdutos();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alterarDisponibilidade(produto) {
    setOperacaoId(produto.id);
    setErro("");
    setSucesso("");

    try {
      await produtoService.alterarDisponibilidade(
        produto.id,
        !produto.disponivel
      );

      setSucesso(
        produto.disponivel
          ? "Produto desativado com sucesso."
          : "Produto ativado com sucesso."
      );

      await carregarProdutos();
    } catch (error) {
      setErro(error.message);
    } finally {
      setOperacaoId(null);
    }
  }

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = pesquisa.toLowerCase();

    return (
      produto.nome?.toLowerCase().includes(termo) ||
      produto.categoria?.toLowerCase().includes(termo) ||
      produto.descricao?.toLowerCase().includes(termo)
    );
  });

  const disponiveis = produtos.filter(
    (produto) => produto.disponivel
  ).length;

  const indisponiveis = produtos.length - disponiveis;

  const formatarPreco = (preco) =>
    Number(preco).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Catálogo
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Produtos
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Gerencie os produtos disponíveis no cardápio.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirCadastro}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Novo produto
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
        <Resumo
          titulo="Total de produtos"
          valor={produtos.length}
          descricao="Produtos cadastrados"
        />

        <Resumo
          titulo="Disponíveis"
          valor={disponiveis}
          descricao="Visíveis para pedidos"
        />

        <Resumo
          titulo="Indisponíveis"
          valor={indisponiveis}
          descricao="Fora do cardápio"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Catálogo de produtos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Consulte e edite os produtos cadastrados.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
              placeholder="Buscar produto..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {carregando ? (
          <div className="flex min-h-48 items-center justify-center">
            <LoaderCircle
              size={28}
              className="animate-spin text-blue-600"
            />
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <Package size={36} className="text-slate-400" />

            <p className="mt-3 font-semibold text-slate-800">
              Nenhum produto encontrado
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Cadastre um produto ou altere a pesquisa.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {produtosFiltrados.map((produto) => (
                <article
                  key={produto.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {produto.nome}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {produto.categoria}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        produto.disponivel
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {produto.disponivel
                        ? "Disponível"
                        : "Indisponível"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    {produto.descricao || "Sem descrição"}
                  </p>

                  <p className="mt-3 text-lg font-bold text-slate-900">
                    {formatarPreco(produto.preco)}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEdicao(produto)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => alterarDisponibilidade(produto)}
                      disabled={operacaoId === produto.id}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                    >
                      {operacaoId === produto.id ? (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Power size={16} />
                      )}

                      {produto.disponivel ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-4 font-semibold">Produto</th>
                    <th className="px-4 py-4 font-semibold">Categoria</th>
                    <th className="px-4 py-4 font-semibold">Preço</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 text-right font-semibold">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {produtosFiltrados.map((produto) => (
                    <tr
                      key={produto.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {produto.nome}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {produto.descricao || "Sem descrição"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {produto.categoria}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {formatarPreco(produto.preco)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            produto.disponivel
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {produto.disponivel
                            ? "Disponível"
                            : "Indisponível"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => abrirEdicao(produto)}
                            title="Editar produto"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => alterarDisponibilidade(produto)}
                            disabled={operacaoId === produto.id}
                            title={
                              produto.disponivel
                                ? "Desativar produto"
                                : "Ativar produto"
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                          >
                            {operacaoId === produto.id ? (
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Power size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalAberto(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="produto-titulo"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="produto-titulo"
                  className="text-xl font-bold text-slate-900"
                >
                  {produtoEditando ? "Editar produto" : "Novo produto"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Preencha as informações do produto.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalAberto(false)}
                aria-label="Fechar formulário"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarProduto} className="space-y-5">
              <div>
                <label
                  htmlFor="nome"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nome
                </label>

                <input
                  id="nome"
                  name="nome"
                  value={formulario.nome}
                  onChange={atualizarCampo}
                  maxLength={150}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ex.: Refrigerante"
                />
              </div>

              <div>
                <label
                  htmlFor="categoria"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Categoria
                </label>

                <input
                  id="categoria"
                  name="categoria"
                  value={formulario.categoria}
                  onChange={atualizarCampo}
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ex.: Bebidas"
                />
              </div>

              <div>
                <label
                  htmlFor="preco"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Preço (R$)
                </label>

                <input
                  id="preco"
                  name="preco"
                  type="text"
                  inputMode="decimal"
                  value={formulario.preco}
                  onChange={atualizarCampo}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label
                  htmlFor="descricao"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Descrição
                </label>

                <textarea
                  id="descricao"
                  name="descricao"
                  value={formulario.descricao}
                  onChange={atualizarCampo}
                  rows={3}
                  maxLength={500}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Descrição opcional do produto"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {salvando ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  {salvando ? "Salvando..." : "Salvar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Resumo({ titulo, valor, descricao }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{titulo}</p>

      <p className="mt-3 text-3xl font-bold text-slate-900">{valor}</p>

      <p className="mt-3 text-xs text-slate-500">{descricao}</p>
    </article>
  );
}

export default Produtos;