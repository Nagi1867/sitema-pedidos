package com.server.server.controllers;

import com.server.server.entities.Mesa;
import com.server.server.services.MesaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mesas")
public class MesaController {

    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    @GetMapping
    public ResponseEntity<List<Mesa>> findAll() {
        return ResponseEntity.ok(mesaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mesa> findById(@PathVariable Long id) {
        return ResponseEntity.ok(mesaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Mesa> create(@RequestBody Mesa mesa) {
        Mesa novaMesa = mesaService.create(mesa);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(novaMesa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mesa> update(
            @PathVariable Long id,
            @RequestBody Mesa mesa
    ) {
        Mesa mesaAtualizada = mesaService.update(id, mesa);

        return ResponseEntity.ok(mesaAtualizada);
    }

    @PatchMapping("/{id}/atividade")
    public ResponseEntity<Mesa> alterarAtividade(
            @PathVariable Long id,
            @RequestBody AlterarAtividadeRequest request
    ) {
        Mesa mesaAtualizada = mesaService.alterarAtividade(
                id,
                request.ativa()
        );

        return ResponseEntity.ok(mesaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mesaService.delete(id);

        return ResponseEntity.noContent().build();
    }

    public record AlterarAtividadeRequest(Boolean ativa) {
    }
}