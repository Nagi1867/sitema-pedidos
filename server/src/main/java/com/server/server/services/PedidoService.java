package com.server.server.services;

import com.server.server.entities.ClienteSessao;
import com.server.server.entities.Comanda;
import com.server.server.entities.ItemPedido;
import com.server.server.entities.Pedido;
import com.server.server.entities.Produto;
import com.server.server.entities.enums.StatusComanda;
import com.server.server.entities.enums.StatusPedido;
import com.server.server.repositories.ClienteSessaoRepository;
import com.server.server.repositories.ComandaRepository;
import com.server.server.repositories.ItemPedidoRepository;
import com.server.server.repositories.PedidoRepository;
import com.server.server.repositories.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteSessaoRepository clienteSessaoRepository;
    private final ComandaRepository comandaRepository;
    private final ProdutoRepository produtoRepository;
    private final ItemPedidoRepository itemPedidoRepository;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ClienteSessaoRepository clienteSessaoRepository,
            ComandaRepository comandaRepository,
            ProdutoRepository produtoRepository,
            ItemPedidoRepository itemPedidoRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.clienteSessaoRepository = clienteSessaoRepository;
        this.comandaRepository = comandaRepository;
        this.produtoRepository = produtoRepository;
        this.itemPedidoRepository = itemPedidoRepository;
    }

    @Transactional(readOnly = true)
    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Pedido findById(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Pedido> findByComanda(Long comandaId) {
        if (!comandaRepository.existsById(comandaId)) {
            throw new RuntimeException("Comanda não encontrada");
        }

        return pedidoRepository.findByComandaId(comandaId);
    }

    @Transactional(readOnly = true)
    public List<Pedido> findByClienteSessao(Long clienteSessaoId) {
        if (!clienteSessaoRepository.existsById(clienteSessaoId)) {
            throw new RuntimeException("Sessão do cliente não encontrada");
        }

        return pedidoRepository.findByClienteSessaoId(clienteSessaoId);
    }

    @Transactional(readOnly = true)
    public List<Pedido> findByTokenAcesso(String tokenAcesso) {
        ClienteSessao clienteSessao = buscarSessaoPorToken(tokenAcesso);

        return pedidoRepository.findByClienteSessaoId(clienteSessao.getId());
    }

    @Transactional(readOnly = true)
    public List<Pedido> findByStatus(StatusPedido status) {
        if (status == null) {
            throw new RuntimeException("O status do pedido deve ser informado");
        }

        return pedidoRepository.findByStatus(status);
    }

    @Transactional
    public Pedido criarPedido(
            String tokenAcesso,
            Map<Long, Integer> produtosSolicitados,
            String observacao
    ) {
        ClienteSessao clienteSessao = buscarSessaoPorToken(tokenAcesso);

        if (produtosSolicitados == null || produtosSolicitados.isEmpty()) {
            throw new RuntimeException("O pedido deve conter pelo menos um produto");
        }

        if (observacao != null && observacao.length() > 500) {
            throw new RuntimeException("A observação deve ter no máximo 500 caracteres");
        }

        Comanda comanda = clienteSessao.getComanda();

        if (comanda == null || comanda.getStatus() != StatusComanda.ABERTA) {
            throw new RuntimeException("A comanda não está aberta");
        }

        Pedido pedido = new Pedido();
        pedido.setComanda(comanda);
        pedido.setClienteSessao(clienteSessao);
        pedido.setStatus(StatusPedido.AGUARDANDO_CONFIRMACAO);
        pedido.setObservacao(
                observacao == null || observacao.isBlank()
                        ? null
                        : observacao.trim()
        );

        pedido = pedidoRepository.save(pedido);

        for (Map.Entry<Long, Integer> itemSolicitado : produtosSolicitados.entrySet()) {
            Long produtoId = itemSolicitado.getKey();
            Integer quantidade = itemSolicitado.getValue();

            if (produtoId == null) {
                throw new RuntimeException("O identificador do produto é obrigatório");
            }

            if (quantidade == null || quantidade < 1 || quantidade > 99) {
                throw new RuntimeException(
                        "A quantidade de cada produto deve estar entre 1 e 99"
                );
            }

            Produto produto = produtoRepository.findById(produtoId)
                    .orElseThrow(() -> new RuntimeException(
                            "Produto não encontrado: " + produtoId
                    ));

            if (!Boolean.TRUE.equals(produto.getDisponivel())) {
                throw new RuntimeException(
                        "O produto não está disponível: " + produto.getNome()
                );
            }

            if (produto.getPreco() == null
                    || produto.getPreco().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException(
                        "O produto possui um preço inválido: " + produto.getNome()
                );
            }

            ItemPedido item = new ItemPedido();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setQuantidade(quantidade);
            item.setPrecoUnitario(produto.getPreco());

            itemPedidoRepository.save(item);
        }

        return pedido;
    }

    @Transactional
    public Pedido atualizarStatus(Long pedidoId, StatusPedido novoStatus) {
        if (novoStatus == null) {
            throw new RuntimeException("O novo status deve ser informado");
        }

        Pedido pedido = findById(pedidoId);
        StatusPedido statusAtual = pedido.getStatus();

        if (statusAtual == novoStatus) {
            return pedido;
        }

        validarTransicao(statusAtual, novoStatus);

        if (novoStatus == StatusPedido.CONFIRMADO) {
            Comanda comanda = pedido.getComanda();

            if (comanda.getStatus() != StatusComanda.ABERTA) {
                throw new RuntimeException(
                        "Não é possível confirmar um pedido de uma comanda que não está aberta"
                );
            }

            BigDecimal valorPedido = calcularValorPedido(pedido.getId());

            BigDecimal valorAtual = comanda.getValorTotal() == null
                    ? BigDecimal.ZERO
                    : comanda.getValorTotal();

            comanda.setValorTotal(valorAtual.add(valorPedido));
            comandaRepository.save(comanda);
        }

        if (novoStatus == StatusPedido.CANCELADO
                && statusAtual != StatusPedido.AGUARDANDO_CONFIRMACAO) {

            Comanda comanda = pedido.getComanda();
            BigDecimal valorPedido = calcularValorPedido(pedido.getId());

            BigDecimal valorAtual = comanda.getValorTotal() == null
                    ? BigDecimal.ZERO
                    : comanda.getValorTotal();

            BigDecimal novoTotal = valorAtual.subtract(valorPedido);

            if (novoTotal.compareTo(BigDecimal.ZERO) < 0) {
                novoTotal = BigDecimal.ZERO;
            }

            comanda.setValorTotal(novoTotal);
            comandaRepository.save(comanda);
        }

        pedido.setStatus(novoStatus);

        return pedidoRepository.save(pedido);
    }

    private ClienteSessao buscarSessaoPorToken(String tokenAcesso) {
        if (tokenAcesso == null || tokenAcesso.isBlank()) {
            throw new RuntimeException("Token de acesso não informado");
        }

        return clienteSessaoRepository.findByTokenAcesso(tokenAcesso)
                .orElseThrow(() -> new RuntimeException(
                        "Sessão do cliente não encontrada ou token inválido"
                ));
    }

    private BigDecimal calcularValorPedido(Long pedidoId) {
        List<ItemPedido> itens = itemPedidoRepository.findByPedidoId(pedidoId);

        BigDecimal total = BigDecimal.ZERO;

        for (ItemPedido item : itens) {
            if (item.getPrecoUnitario() == null || item.getQuantidade() == null) {
                throw new RuntimeException(
                        "Um item do pedido possui preço ou quantidade inválidos"
                );
            }

            BigDecimal subtotal = item.getPrecoUnitario()
                    .multiply(BigDecimal.valueOf(item.getQuantidade()));

            total = total.add(subtotal);
        }

        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O pedido não possui itens com valores válidos");
        }

        return total;
    }

    private void validarTransicao(
            StatusPedido statusAtual,
            StatusPedido novoStatus
    ) {
        boolean transicaoPermitida = switch (statusAtual) {
            case AGUARDANDO_CONFIRMACAO ->
                    novoStatus == StatusPedido.CONFIRMADO
                            || novoStatus == StatusPedido.CANCELADO;

            case CONFIRMADO ->
                    novoStatus == StatusPedido.EM_PREPARACAO
                            || novoStatus == StatusPedido.CANCELADO;

            case EM_PREPARACAO ->
                    novoStatus == StatusPedido.PRONTO
                            || novoStatus == StatusPedido.CANCELADO;

            case PRONTO ->
                    novoStatus == StatusPedido.ENTREGUE
                            || novoStatus == StatusPedido.CANCELADO;

            case ENTREGUE, CANCELADO -> false;
        };

        if (!transicaoPermitida) {
            throw new RuntimeException(
                    "Não é permitido alterar o pedido de "
                            + statusAtual + " para " + novoStatus
            );
        }
    }
}