package com.server.server.repositories;

import com.server.server.entities.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByDisponivelTrue();

    List<Produto> findByCategoria(String categoria);

    List<Produto> findByCategoriaAndDisponivelTrue(String categoria);
}
