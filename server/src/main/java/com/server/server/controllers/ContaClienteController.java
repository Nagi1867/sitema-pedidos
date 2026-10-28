package com.server.server.controllers;

import com.server.server.dto.ContaClienteDTO;
import com.server.server.dto.RegistrarPagamentoDTO;
import com.server.server.services.ContaClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comandas/{comandaId}/contas")
public class ContaClienteController {

    private final ContaClienteService contaClienteService;

    public ContaClienteController(ContaClienteService contaClienteService) {
        this.contaClienteService = contaClienteService;
    }

    @GetMapping
    public ResponseEntity<List<ContaClienteDTO>> listarContas(
            @PathVariable Long comandaId
    ) {
        return ResponseEntity.ok(
                contaClienteService.listarContas(comandaId)
        );
    }

    @GetMapping("/{clienteSessaoId}")
    public ResponseEntity<ContaClienteDTO> consultarConta(
            @PathVariable Long comandaId,
            @PathVariable Long clienteSessaoId
    ) {
        return ResponseEntity.ok(
                contaClienteService.consultarConta(comandaId, clienteSessaoId)
        );
    }

    @PostMapping("/{clienteSessaoId}/pagamentos")
    public ResponseEntity<ContaClienteDTO> registrarPagamento(
            @PathVariable Long comandaId,
            @PathVariable Long clienteSessaoId,
            @RequestBody RegistrarPagamentoDTO requisicao
    ) {
        return ResponseEntity.ok(
                contaClienteService.registrarPagamento(
                        comandaId,
                        clienteSessaoId,
                        requisicao
                )
        );
    }
}