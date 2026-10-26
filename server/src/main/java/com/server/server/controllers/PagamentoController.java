package com.server.server.controllers;

import com.server.server.entities.Pagamento;
import com.server.server.entities.enums.StatusPagamento;
import com.server.server.services.PagamentoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/pagamentos")
public class PagamentoController {

    private final PagamentoService pagamentoService;

    public PagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }

    @GetMapping
    public ResponseEntity<List<Pagamento>> findAll() {
        return ResponseEntity.ok(pagamentoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pagamento> findById(@PathVariable Long id) {
        return ResponseEntity.ok(pagamentoService.findById(id));
    }

    @GetMapping("/comanda/{comandaId}")
    public ResponseEntity<List<Pagamento>> findByComanda(
            @PathVariable Long comandaId
    ) {
        return ResponseEntity.ok(
                pagamentoService.findByComanda(comandaId)
        );
    }

    @GetMapping("/participante/{clienteSessaoId}")
    public ResponseEntity<List<Pagamento>> findByClienteSessao(
            @PathVariable Long clienteSessaoId
    ) {
        return ResponseEntity.ok(
                pagamentoService.findByClienteSessao(clienteSessaoId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Pagamento>> findByStatus(
            @PathVariable StatusPagamento status
    ) {
        return ResponseEntity.ok(
                pagamentoService.findByStatus(status)
        );
    }

    @PostMapping
    public ResponseEntity<Pagamento> registrarPagamento(
            @RequestBody RegistrarPagamentoRequest request
    ) {
        Pagamento pagamento = pagamentoService.registrarPagamento(
                request.comandaId(),
                request.clienteSessaoId(),
                request.valor(),
                request.metodoPagamento()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(pagamento);
    }

    @GetMapping("/comanda/{comandaId}/total-pago")
    public ResponseEntity<BigDecimal> calcularTotalPago(
            @PathVariable Long comandaId
    ) {
        return ResponseEntity.ok(
                pagamentoService.calcularTotalPago(comandaId)
        );
    }

    @GetMapping("/comanda/{comandaId}/saldo-restante")
    public ResponseEntity<BigDecimal> calcularSaldoRestante(
            @PathVariable Long comandaId
    ) {
        return ResponseEntity.ok(
                pagamentoService.calcularSaldoRestante(comandaId)
        );
    }

    public record RegistrarPagamentoRequest(
            Long comandaId,
            Long clienteSessaoId,
            BigDecimal valor,
            com.server.server.entities.enums.MetodoPagamento metodoPagamento
    ) {
    }
}