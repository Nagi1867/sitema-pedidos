package com.server.server.repositories;

import com.server.server.entities.DivisaoItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DivisaoItemRepository extends JpaRepository<DivisaoItem, Long> {

    List<DivisaoItem> findByItemPedidoId(Long itemPedidoId);

    List<DivisaoItem> findByClienteSessaoId(Long clienteSessaoId);

    boolean existsByItemPedidoIdAndClienteSessaoId(
            Long itemPedidoId,
            Long clienteSessaoId
    );
}
