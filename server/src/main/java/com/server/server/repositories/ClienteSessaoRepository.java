package com.server.server.repositories;

import com.server.server.entities.ClienteSessao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteSessaoRepository extends JpaRepository<ClienteSessao, Long> {

    Optional<ClienteSessao> findByTokenAcesso(String tokenAcesso);

    List<ClienteSessao> findByComandaId(Long comandaId);

    List<ClienteSessao> findByComandaIdAndAutorizadoTrue(Long comandaId);

    boolean existsByTokenAcesso(String tokenAcesso);
}
