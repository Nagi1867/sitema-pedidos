package com.server.server.services;

import com.server.server.entities.ItemPedido;
import com.server.server.entities.Pedido;
import com.server.server.repositories.ItemPedidoRepository;
import com.server.server.repositories.PedidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ItemPedidoService {

    private final ItemPedidoRepository itemPedidoRepository;
    private final PedidoRepository pedidoRepository;

    public ItemPedidoService(
            ItemPedidoRepository itemPedidoRepository,
            PedidoRepository pedidoRepository
    ) {
        this.itemPedidoRepository = itemPedidoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional(readOnly = true)
    public List<ItemPedido> findAll() {
        return itemPedidoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ItemPedido findById(Long id) {
        return itemPedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item do pedido não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<ItemPedido> findByPedido(Long pedidoId) {
        if (!pedidoRepository.existsById(pedidoId)) {
            throw new RuntimeException("Pedido não encontrado");
        }

        return itemPedidoRepository.findByPedidoId(pedidoId);
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularSubtotal(Long itemPedidoId) {
        ItemPedido item = findById(itemPedidoId);

        validarItem(item);

        return item.getPrecoUnitario()
                .multiply(BigDecimal.valueOf(item.getQuantidade()));
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularTotalPedido(Long pedidoId) {
        if (!pedidoRepository.existsById(pedidoId)) {
            throw new RuntimeException("Pedido não encontrado");
        }

        List<ItemPedido> itens = itemPedidoRepository.findByPedidoId(pedidoId);

        BigDecimal total = BigDecimal.ZERO;

        for (ItemPedido item : itens) {
            validarItem(item);

            BigDecimal subtotal = item.getPrecoUnitario()
                    .multiply(BigDecimal.valueOf(item.getQuantidade()));

            total = total.add(subtotal);
        }

        return total;
    }

    private void validarItem(ItemPedido item) {
        if (item.getPrecoUnitario() == null
                || item.getPrecoUnitario().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("O preço do item é inválido");
        }

        if (item.getQuantidade() == null || item.getQuantidade() <= 0) {
            throw new RuntimeException("A quantidade do item é inválida");
        }
    }
}