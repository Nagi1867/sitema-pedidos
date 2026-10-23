package com.server.server.services;

import com.server.server.entities.ClienteSessao;
import com.server.server.entities.Comanda;
import com.server.server.entities.DivisaoItem;
import com.server.server.entities.ItemPedido;
import com.server.server.entities.Pedido;
import com.server.server.entities.enums.StatusComanda;
import com.server.server.entities.enums.StatusPedido;
import com.server.server.repositories.ClienteSessaoRepository;
import com.server.server.repositories.DivisaoItemRepository;
import com.server.server.repositories.ItemPedidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DivisaoItemService {

    private final DivisaoItemRepository divisaoItemRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final ClienteSessaoRepository clienteSessaoRepository;

    public DivisaoItemService(
            DivisaoItemRepository divisaoItemRepository,
            ItemPedidoRepository itemPedidoRepository,
            ClienteSessaoRepository clienteSessaoRepository
    ) {
        this.divisaoItemRepository = divisaoItemRepository;
        this.itemPedidoRepository = itemPedidoRepository;
        this.clienteSessaoRepository = clienteSessaoRepository;
    }

    @Transactional(readOnly = true)
    public List<DivisaoItem> findAll() {
        return divisaoItemRepository.findAll();
    }

    @Transactional(readOnly = true)
    public DivisaoItem findById(Long id) {
        return divisaoItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Divisão do item não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<DivisaoItem> findByItemPedido(Long itemPedidoId) {
        if (!itemPedidoRepository.existsById(itemPedidoId)) {
            throw new RuntimeException("Item do pedido não encontrado");
        }

        return divisaoItemRepository.findByItemPedidoId(itemPedidoId);
    }

    @Transactional(readOnly = true)
    public List<DivisaoItem> findByClienteSessao(Long clienteSessaoId) {
        if (!clienteSessaoRepository.existsById(clienteSessaoId)) {
            throw new RuntimeException("Sessão do cliente não encontrada");
        }

        return divisaoItemRepository.findByClienteSessaoId(clienteSessaoId);
    }

    @Transactional
    public DivisaoItem dividirItem(
            Long itemPedidoId,
            Long clienteSessaoId,
            BigDecimal valorResponsabilidade
    ) {
        if (valorResponsabilidade == null
                || valorResponsabilidade.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException(
                    "O valor da responsabilidade deve ser maior que zero"
            );
        }

        if (valorResponsabilidade.scale() > 2) {
            throw new RuntimeException(
                    "O valor deve possuir no máximo duas casas decimais"
            );
        }

        ItemPedido itemPedido = itemPedidoRepository.findById(itemPedidoId)
                .orElseThrow(() -> new RuntimeException("Item do pedido não encontrado"));

        ClienteSessao clienteSessao = clienteSessaoRepository.findById(clienteSessaoId)
                .orElseThrow(() -> new RuntimeException("Sessão do cliente não encontrada"));

        Pedido pedido = itemPedido.getPedido();

        if (pedido == null || pedido.getComanda() == null) {
            throw new RuntimeException(
                    "O item não está associado corretamente a uma comanda"
            );
        }

        Comanda comanda = pedido.getComanda();

        if (!comanda.getId().equals(clienteSessao.getComanda().getId())) {
            throw new RuntimeException(
                    "O participante não pertence à comanda deste item"
            );
        }

        if (!Boolean.TRUE.equals(clienteSessao.getAutorizado())) {
            throw new RuntimeException(
                    "O participante não está autorizado"
            );
        }

        if (comanda.getStatus() != StatusComanda.ABERTA
                && comanda.getStatus() != StatusComanda.AGUARDANDO_PAGAMENTO) {
            throw new RuntimeException(
                    "Não é possível dividir itens de uma comanda fechada"
            );
        }

        if (pedido.getStatus() == StatusPedido.CANCELADO) {
            throw new RuntimeException(
                    "Não é possível dividir um item de um pedido cancelado"
            );
        }

        if (divisaoItemRepository.existsByItemPedidoIdAndClienteSessaoId(
                itemPedidoId,
                clienteSessaoId
        )) {
            throw new RuntimeException(
                    "Este participante já possui uma divisão deste item"
            );
        }

        BigDecimal valorTotalItem = calcularValorTotalItem(itemPedido);

        BigDecimal valorJaDividido = calcularValorJaDividido(itemPedidoId);

        BigDecimal novoTotalDividido = valorJaDividido.add(valorResponsabilidade);

        if (novoTotalDividido.compareTo(valorTotalItem) > 0) {
            throw new RuntimeException(
                    "A divisão ultrapassa o valor total do item. Valor restante: R$ "
                            + valorTotalItem.subtract(valorJaDividido)
            );
        }

        DivisaoItem divisaoItem = new DivisaoItem();
        divisaoItem.setItemPedido(itemPedido);
        divisaoItem.setClienteSessao(clienteSessao);
        divisaoItem.setValorResponsabilidade(valorResponsabilidade);

        return divisaoItemRepository.save(divisaoItem);
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularValorJaDividido(Long itemPedidoId) {
        List<DivisaoItem> divisoes = findByItemPedido(itemPedidoId);

        BigDecimal total = BigDecimal.ZERO;

        for (DivisaoItem divisao : divisoes) {
            if (divisao.getValorResponsabilidade() != null) {
                total = total.add(divisao.getValorResponsabilidade());
            }
        }

        return total;
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularValorTotalItem(Long itemPedidoId) {
        ItemPedido itemPedido = itemPedidoRepository.findById(itemPedidoId)
                .orElseThrow(() -> new RuntimeException("Item do pedido não encontrado"));

        return calcularValorTotalItem(itemPedido);
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularSaldoItem(Long itemPedidoId) {
        BigDecimal valorTotal = calcularValorTotalItem(itemPedidoId);
        BigDecimal valorDividido = calcularValorJaDividido(itemPedidoId);

        return valorTotal.subtract(valorDividido);
    }

    @Transactional
    public void delete(Long id) {
        DivisaoItem divisaoItem = findById(id);

        divisaoItemRepository.delete(divisaoItem);
    }

    private BigDecimal calcularValorTotalItem(ItemPedido itemPedido) {
        if (itemPedido.getPrecoUnitario() == null
                || itemPedido.getQuantidade() == null
                || itemPedido.getQuantidade() <= 0
                || itemPedido.getPrecoUnitario().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException(
                    "O item possui preço ou quantidade inválidos"
            );
        }

        return itemPedido.getPrecoUnitario()
                .multiply(BigDecimal.valueOf(itemPedido.getQuantidade()));
    }
}