package com.server.server.repositories;

import com.server.server.entities.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MesaRepository extends JpaRepository<Mesa, Long> {

    boolean existsByNumero(Integer numero);
}
