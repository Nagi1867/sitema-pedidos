package com.server.server.repositories;

import com.server.server.entities.PagamentoCliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagamentoClienteRepository
        extends JpaRepository<PagamentoCliente, Long> {

    List<PagamentoCliente> findByClienteSessaoId(Long clienteSessaoId);
}