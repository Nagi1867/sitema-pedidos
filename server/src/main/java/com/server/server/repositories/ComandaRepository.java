package com.server.server.repositories;

import com.server.server.entities.Comanda;
import com.server.server.entities.enums.StatusComanda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComandaRepository extends JpaRepository<Comanda, Long> {

    Optional<Comanda> findByCodigoAcesso(String codigoAcesso);

    List<Comanda> findByMesaId(Long mesaId);

    List<Comanda> findByStatus(StatusComanda status);

    Optional<Comanda> findByMesaIdAndStatus(
            Long mesaId,
            StatusComanda status
    );

    boolean existsByCodigoAcesso(String codigoAcesso);
}