package com.server.server.controllers;

import com.server.server.entities.Pedido;
import com.server.server.entities.enums.StatusPedido;
import com.server.server.services.PedidoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> findAll() {
        return ResponseEntity.ok(pedidoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> findById(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.findById(id));
    }

    @GetMapping("/comanda/{comandaId}")
    public ResponseEntity<List<Pedido>> findByComanda(
            @PathVariable Long comandaId
    ) {
        return ResponseEntity.ok(
                pedidoService.findByComanda(comandaId)
        );
    }

    @GetMapping("/participante/{clienteSessaoId}")
    public ResponseEntity<List<Pedido>> findByClienteSessao(
            @PathVariable Long clienteSessaoId
    ) {
        return ResponseEntity.ok(
                pedidoService.findByClienteSessao(clienteSessaoId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Pedido>> findByStatus(
            @PathVariable StatusPedido status
    ) {
        return ResponseEntity.ok(
                pedidoService.findByStatus(status)
        );
    }

    @GetMapping("/meus")
    public ResponseEntity<List<Pedido>> listarMeusPedidos(
            @RequestHeader("X-Cliente-Token") String tokenAcesso
    ) {
        return ResponseEntity.ok(
                pedidoService.findByTokenAcesso(tokenAcesso)
        );
    }

    @PostMapping("/participante")
    public ResponseEntity<Pedido> criarPedido(
            @RequestHeader("X-Cliente-Token") String tokenAcesso,
            @RequestBody CriarPedidoRequest request
    ) {
        Pedido pedido = pedidoService.criarPedido(
                tokenAcesso,
                request.produtos(),
                request.observacao()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Pedido> atualizarStatus(
            @PathVariable Long id,
            @RequestBody AtualizarStatusRequest request
    ) {
        Pedido pedido = pedidoService.atualizarStatus(
                id,
                request.status()
        );

        return ResponseEntity.ok(pedido);
    }

    public record CriarPedidoRequest(
            Map<Long, Integer> produtos,
            String observacao
    ) {
    }

    public record AtualizarStatusRequest(StatusPedido status) {
    }
}