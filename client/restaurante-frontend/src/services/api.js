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