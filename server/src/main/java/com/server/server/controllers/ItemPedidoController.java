package com.server.server.controllers;

import com.server.server.entities.ItemPedido;
import com.server.server.services.ItemPedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/itens-pedido")
public class ItemPedidoController {

    private final ItemPedidoService itemPedidoService;

    public ItemPedidoController(ItemPedidoService itemPedidoService) {
        this.itemPedidoService = itemPedidoService;
    }

    @GetMapping
    public ResponseEntity<List<ItemPedido>> findAll() {
        return ResponseEntity.ok(itemPedidoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemPedido> findById(@PathVariable Long id) {
        return ResponseEntity.ok(itemPedidoService.findById(id));
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<ItemPedido>> findByPedido(
            @PathVariable Long pedidoId
    ) {
        return ResponseEntity.ok(itemPedidoService.findByPedido(pedidoId));
    }

    @GetMapping("/{id}/subtotal")
    public ResponseEntity<BigDecimal> calcularSubtotal(@PathVariable Long id) {
        return ResponseEntity.ok(itemPedidoService.calcularSubtotal(id));
    }

    @GetMapping("/pedido/{pedidoId}/total")
    public ResponseEntity<BigDecimal> calcularTotalPedido(
            @PathVariable Long pedidoId
    ) {
        return ResponseEntity.ok(
                itemPedidoService.calcularTotalPedido(pedidoId)
        );
    }
}