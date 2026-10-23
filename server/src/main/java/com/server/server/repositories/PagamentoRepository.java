package com.server.server.repositories;

import com.server.server.entities.Pagamento;
import com.server.server.entities.enums.StatusPagamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

    List<Pagamento> findByComandaId(Long comandaId);

    List<Pagamento> findByClienteSessaoId(Long clienteSessaoId);

    List<Pagamento> findByStatus(StatusPagamento status);

    List<Pagamento> findByComandaIdAndStatus(
            Long comandaId,
            StatusPagamento status
    );
}
