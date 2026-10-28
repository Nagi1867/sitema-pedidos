package com.server.server.controllers;

import com.server.server.entities.ClienteSessao;
import com.server.server.services.ClienteSessaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sessoes")
public class ClienteSessaoController {

    private final ClienteSessaoService clienteSessaoService;

    public ClienteSessaoController(ClienteSessaoService clienteSessaoService) {
        this.clienteSessaoService = clienteSessaoService;
    }

    @GetMapping
    public ResponseEntity<List<ClienteSessao>> findAll() {
        return ResponseEntity.ok(clienteSessaoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteSessao> findById(@PathVariable Long id) {
        return ResponseEntity.ok(clienteSessaoService.findById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<ClienteSessao> buscarMinhaSessao(
            @RequestHeader("X-Cliente-Token") String tokenAcesso
    ) {
        return ResponseEntity.ok(
                clienteSessaoService.findByTokenAcesso(tokenAcesso)
        );
    }

    @GetMapping("/comanda/{comandaId}")
    public ResponseEntity<List<ClienteSessao>> findByComanda(
            @PathVariable Long comandaId
    ) {
        return ResponseEntity.ok(
                clienteSessaoService.findByComanda(comandaId)
        );
    }

    @PostMapping("/comanda/{comandaId}/entrar")
    public ResponseEntity<ClienteSessao> entrarNaComanda(
            @PathVariable Long comandaId,
            @RequestBody EntrarNaComandaRequest request
    ) {
        ClienteSessao sessao = clienteSessaoService.entrarNaComanda(
                comandaId,
                request.nome()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(sessao);
    }

    @PatchMapping("/{id}/autorizacao")
    public ResponseEntity<ClienteSessao> alterarAutorizacao(
            @PathVariable Long id,
            @RequestBody AlterarAutorizacaoRequest request
    ) {
        ClienteSessao sessao = clienteSessaoService.alterarAutorizacao(
                id,
                request.autorizado()
        );

        return ResponseEntity.ok(sessao);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clienteSessaoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record EntrarNaComandaRequest(String nome) {
    }

    public record AlterarAutorizacaoRequest(Boolean autorizado) {
    }
}