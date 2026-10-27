package com.server.server.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.server.server.entities.enums.StatusPedido;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "comanda_id", nullable = false)
    @JsonIgnore
    private Comanda comanda;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_sessao_id", nullable = false)
    private ClienteSessao clienteSessao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status = StatusPedido.AGUARDANDO_CONFIRMACAO;

    @Column(nullable = false)
    private LocalDateTime dataPedido = LocalDateTime.now();

    @Column(length = 500)
    private String observacao;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    private List<ItemPedido> itens = new ArrayList<>();

    public Pedido() {
    }

    public Long getId() {
        return id;
    }

    public Comanda getComanda() {
        return comanda;
    }

    public void setComanda(Comanda comanda) {
        this.comanda = comanda;
    }

    public ClienteSessao getClienteSessao() {
        return clienteSessao;
    }

    public void setClienteSessao(ClienteSessao clienteSessao) {
        this.clienteSessao = clienteSessao;
    }

    public StatusPedido getStatus() {
        return status;
    }

    public void setStatus(StatusPedido status) {
        this.status = status;
    }

    public LocalDateTime getDataPedido() {
        return dataPedido;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public List<ItemPedido> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedido> itens) {
        this.itens = itens;
    }
}