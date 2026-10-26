const API_URL = "/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let mensagem = "Não foi possível realizar a operação.";

    try {
      const erro = await response.json();
      mensagem = erro.mensagem || erro.message || mensagem;
    } catch {
      mensagem = response.statusText || mensagem;
    }

    throw new Error(mensagem);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const mesaService = {
  listar: () => request("/mesas"),

  cadastrar: (numero) =>
    request("/mesas", {
      method: "POST",
      body: JSON.stringify({ numero }),
    }),

  alterarAtividade: (id, ativa) =>
    request(`/mesas/${id}/atividade`, {
      method: "PATCH",
      body: JSON.stringify({ ativa }),
    }),

  abrirComanda: (mesaId) =>
    request(`/comandas/mesa/${mesaId}/abrir`, {
      method: "POST",
    }),
};

export const produtoService = {
  listar: () => request("/produtos"),

  listarDisponiveis: () => request("/produtos/disponiveis"),

  buscarPorId: (id) => request(`/produtos/${id}`),

  buscarPorCategoria: (categoria) =>
    request(`/produtos/categoria/${encodeURIComponent(categoria)}`),

  cadastrar: (produto) =>
    request("/produtos", {
      method: "POST",
      body: JSON.stringify(produto),
    }),

  atualizar: (id, produto) =>
    request(`/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(produto),
    }),

  alterarDisponibilidade: (id, disponivel) =>
    request(`/produtos/${id}/disponibilidade`, {
      method: "PATCH",
      body: JSON.stringify({ disponivel }),
    }),
};

export const comandaClienteService = {
  buscarPorCodigo: (codigoAcesso) =>
    request(`/comandas/codigo/${encodeURIComponent(codigoAcesso)}`),

  entrar: (comandaId, nome) =>
    request(`/sessoes/comanda/${comandaId}/entrar`, {
      method: "POST",
      body: JSON.stringify({ nome }),
    }),

  buscarSessao: (tokenAcesso) =>
    request(`/sessoes/token/${encodeURIComponent(tokenAcesso)}`),

  listarProdutos: () =>
    request("/produtos/disponiveis"),

  listarPedidos: (comandaId) =>
    request(`/pedidos/comanda/${comandaId}`),

  criarPedido: (clienteSessaoId, produtos, observacao) =>
    request(`/pedidos/participante/${clienteSessaoId}`, {
      method: "POST",
      body: JSON.stringify({
        produtos,
        observacao,
      }),
    }),
};

export const sessaoService = {
  listarPorComanda: (comandaId) =>
    request(`/sessoes/comanda/${comandaId}`),

  alterarAutorizacao: (id, autorizado) =>
    request(`/sessoes/${id}/autorizacao`, {
      method: "PATCH",
      body: JSON.stringify({ autorizado }),
    }),
};

export const pedidoService = {
  listar: () => request("/pedidos"),

  buscarPorId: (id) => request(`/pedidos/${id}`),

  listarPorComanda: (comandaId) =>
    request(`/pedidos/comanda/${comandaId}`),

  listarPorParticipante: (clienteSessaoId) =>
    request(`/pedidos/participante/${clienteSessaoId}`),

  listarPorStatus: (status) =>
    request(`/pedidos/status/${status}`),

  atualizarStatus: (id, status) =>
    request(`/pedidos/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};