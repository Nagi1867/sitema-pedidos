package com.server.server.controllers;

import com.server.server.entities.DivisaoItem;
import com.server.server.services.DivisaoItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/divisoes-itens")
public class DivisaoItemController {

    private final DivisaoItemService divisaoItemService;

    public DivisaoItemController(DivisaoItemService divisaoItemService) {
        this.divisaoItemService = divisaoItemService;
    }

    @GetMapping
    public ResponseEntity<List<DivisaoItem>> findAll() {
        return ResponseEntity.ok(divisaoItemService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DivisaoItem> findById(@PathVariable Long id) {
        return ResponseEntity.ok(divisaoItemService.findById(id));
    }

    @GetMapping("/item/{itemPedidoId}")
    public ResponseEntity<List<DivisaoItem>> findByItemPedido(
            @PathVariable Long itemPedidoId
    ) {
        return ResponseEntity.ok(
                divisaoItemService.findByItemPedido(itemPedidoId)
        );
    }

    @GetMapping("/participante/{clienteSessaoId}")
    public ResponseEntity<List<DivisaoItem>> findByClienteSessao(
            @PathVariable Long clienteSessaoId
    ) {
        return ResponseEntity.ok(
                divisaoItemService.findByClienteSessao(clienteSessaoId)
        );
    }

    @PostMapping
    public ResponseEntity<DivisaoItem> dividirItem(
            @RequestBody DividirItemRequest request
    ) {
        DivisaoItem divisao = divisaoItemService.dividirItem(
                request.itemPedidoId(),
                request.clienteSessaoId(),
                request.valorResponsabilidade()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(divisao);
    }

    @GetMapping("/item/{itemPedidoId}/valor-dividido")
    public ResponseEntity<BigDecimal> calcularValorJaDividido(
            @PathVariable Long itemPedidoId
    ) {
        return ResponseEntity.ok(
                divisaoItemService.calcularValorJaDividido(itemPedidoId)
        );
    }

    @GetMapping("/item/{itemPedidoId}/valor-total")
    public ResponseEntity<BigDecimal> calcularValorTotalItem(
            @PathVariable Long itemPedidoId
    ) {
        return ResponseEntity.ok(
                divisaoItemService.calcularValorTotalItem(itemPedidoId)
        );
    }

    @GetMapping("/item/{itemPedidoId}/saldo")
    public ResponseEntity<BigDecimal> calcularSaldoItem(
            @PathVariable Long itemPedidoId
    ) {
        return ResponseEntity.ok(
                divisaoItemService.calcularSaldoItem(itemPedidoId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        divisaoItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record DividirItemRequest(
            Long itemPedidoId,
            Long clienteSessaoId,
            BigDecimal valorResponsabilidade
    ) {
    }
}