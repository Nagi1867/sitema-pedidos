package com.server.server.controllers;

import com.server.server.entities.Produto;
import com.server.server.services.ProdutoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    public ResponseEntity<List<Produto>> findAll() {
        return ResponseEntity.ok(produtoService.findAll());
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<Produto>> findDisponiveis() {
        return ResponseEntity.ok(produtoService.findDisponiveis());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.findById(id));
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<Produto>> findByCategoria(@PathVariable String categoria) {
        return ResponseEntity.ok(produtoService.findByCategoria(categoria));
    }

    @PostMapping
    public ResponseEntity<Produto> create(@RequestBody Produto produto) {
        Produto novoProduto = produtoService.create(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> update(
            @PathVariable Long id,
            @RequestBody Produto produto
    ) {
        Produto produtoAtualizado = produtoService.update(id, produto);
        return ResponseEntity.ok(produtoAtualizado);
    }

    @PatchMapping("/{id}/disponibilidade")
    public ResponseEntity<Produto> alterarDisponibilidade(
            @PathVariable Long id,
            @RequestBody AlterarDisponibilidadeRequest request
    ) {
        Produto produtoAtualizado = produtoService.alterarDisponibilidade(
                id,
                request.disponivel()
        );

        return ResponseEntity.ok(produtoAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        produtoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record AlterarDisponibilidadeRequest(Boolean disponivel) {
    }
}