package com.server.server.services;

import com.server.server.entities.Produto;
import com.server.server.repositories.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    @Transactional(readOnly = true)
    public List<Produto> findAll() {
        return produtoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Produto> findDisponiveis() {
        return produtoRepository.findByDisponivelTrue();
    }

    @Transactional(readOnly = true)
    public Produto findById(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Produto> findByCategoria(String categoria) {
        return produtoRepository.findByCategoriaAndDisponivelTrue(categoria);
    }

    @Transactional
    public Produto create(Produto produto) {
        validarProduto(produto);

        produto.setDisponivel(true);

        return produtoRepository.save(produto);
    }

    @Transactional
    public Produto update(Long id, Produto produtoAtualizado) {
        validarProduto(produtoAtualizado);

        Produto produto = findById(id);

        produto.setNome(produtoAtualizado.getNome());
        produto.setDescricao(produtoAtualizado.getDescricao());
        produto.setPreco(produtoAtualizado.getPreco());
        produto.setCategoria(produtoAtualizado.getCategoria());

        return produtoRepository.save(produto);
    }

    @Transactional
    public Produto alterarDisponibilidade(Long id, Boolean disponivel) {
        if (disponivel == null) {
            throw new RuntimeException("A disponibilidade deve ser informada");
        }

        Produto produto = findById(id);
        produto.setDisponivel(disponivel);

        return produtoRepository.save(produto);
    }

    @Transactional
    public void delete(Long id) {
        Produto produto = findById(id);
        produtoRepository.delete(produto);
    }

    private void validarProduto(Produto produto) {
        if (produto.getNome() == null || produto.getNome().isBlank()) {
            throw new RuntimeException("O nome do produto é obrigatório");
        }

        if (produto.getNome().length() > 120) {
            throw new RuntimeException("O nome do produto deve ter no máximo 120 caracteres");
        }

        if (produto.getDescricao() != null && produto.getDescricao().length() > 500) {
            throw new RuntimeException("A descrição deve ter no máximo 500 caracteres");
        }

        if (produto.getCategoria() != null && produto.getCategoria().length() > 100) {
            throw new RuntimeException("A categoria deve ter no máximo 100 caracteres");
        }

        if (produto.getPreco() == null || produto.getPreco().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O preço do produto deve ser maior que zero");
        }
    }
}