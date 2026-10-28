package com.server.server.dto;

import java.math.BigDecimal;
import java.util.List;

public record ContaClienteDTO(
        Long clienteSessaoId,
        String nome,
        BigDecimal valorTotal,
        BigDecimal valorPago,
        BigDecimal saldoPendente,
        boolean pago,
        List<ItemContaDTO> itens
) {
    public record ItemContaDTO(
            Long itemPedidoId,
            String produto,
            Integer quantidade,
            BigDecimal valorUnitario,
            BigDecimal valorResponsabilidade,
            boolean compartilhado
    ) {
    }
}