package com.server.server.controllers;

import com.server.server.entities.Comanda;
import com.server.server.services.ComandaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comandas")
public class ComandaController {

    private final ComandaService comandaService;

    public ComandaController(ComandaService comandaService) {
        this.comandaService = comandaService;
    }

    @GetMapping
    public ResponseEntity<List<Comanda>> findAll() {
        return ResponseEntity.ok(comandaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comanda> findById(@PathVariable Long id) {
        return ResponseEntity.ok(comandaService.findById(id));
    }

    @GetMapping("/mesa/{mesaId}")
    public ResponseEntity<List<Comanda>> findByMesa(
            @PathVariable Long mesaId
    ) {
        return ResponseEntity.ok(comandaService.findByMesa(mesaId));
    }

    @GetMapping("/codigo/{codigoAcesso}")
    public ResponseEntity<Comanda> findByCodigoAcesso(
            @PathVariable String codigoAcesso
    ) {
        return ResponseEntity.ok(
                comandaService.findByCodigoAcesso(codigoAcesso)
        );
    }

    @PostMapping("/mesa/{mesaId}/abrir")
    public ResponseEntity<Comanda> abrirComanda(
            @PathVariable Long mesaId
    ) {
        Comanda comanda = comandaService.abrirComanda(mesaId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(comanda);
    }

    @PatchMapping("/{id}/fechar")
    public ResponseEntity<Comanda> fecharComanda(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                comandaService.fecharComanda(id)
        );
    }
}