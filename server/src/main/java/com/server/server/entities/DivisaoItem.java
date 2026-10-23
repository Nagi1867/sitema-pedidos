package com.server.server.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "divisoes_item")
public class DivisaoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_pedido_id", nullable = false)
    private ItemPedido itemPedido;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_sessao_id", nullable = false)
    private ClienteSessao clienteSessao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorResponsabilidade;

    public DivisaoItem() {
    }

    public Long getId() {
        return id;
    }

    public ItemPedido getItemPedido() {
        return itemPedido;
    }

    public void setItemPedido(ItemPedido itemPedido) {
        this.itemPedido = itemPedido;
    }

    public ClienteSessao getClienteSessao() {
        return clienteSessao;
    }

    public void setClienteSessao(ClienteSessao clienteSessao) {
        this.clienteSessao = clienteSessao;
    }

    public BigDecimal getValorResponsabilidade() {
        return valorResponsabilidade;
    }

    public void setValorResponsabilidade(BigDecimal valorResponsabilidade) {
        this.valorResponsabilidade = valorResponsabilidade;
    }
}