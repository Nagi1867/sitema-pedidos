package com.server.server.repositories;

import com.server.server.entities.Pedido;
import com.server.server.entities.enums.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByComandaId(Long comandaId);

    List<Pedido> findByClienteSessaoId(Long clienteSessaoId);

    List<Pedido> findByStatus(StatusPedido status);

    List<Pedido> findByComandaIdAndStatus(
            Long comandaId,
            StatusPedido status
    );
}
