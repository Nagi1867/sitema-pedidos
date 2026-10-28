package com.server.server.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamentos_clientes")
public class PagamentoCliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_sessao_id", nullable = false)
    private ClienteSessao clienteSessao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDateTime dataPagamento = LocalDateTime.now();

    public PagamentoCliente() {
    }

    public Long getId() {
        return id;
    }

    public ClienteSessao getClienteSessao() {
        return clienteSessao;
    }

    public void setClienteSessao(ClienteSessao clienteSessao) {
        this.clienteSessao = clienteSessao;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDateTime getDataPagamento() {
        return dataPagamento;
    }
}