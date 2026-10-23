package com.server.server.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "clientes_sessao")
public class ClienteSessao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "comanda_id", nullable = false)
    private Comanda comanda;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenAcesso;

    @Column(length = 80)
    private String nome;

    @Column(nullable = false)
    private Boolean autorizado = false;

    @Column(nullable = false)
    private LocalDateTime dataEntrada = LocalDateTime.now();

    public ClienteSessao() {
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

    public String getTokenAcesso() {
        return tokenAcesso;
    }

    public void setTokenAcesso(String tokenAcesso) {
        this.tokenAcesso = tokenAcesso;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Boolean getAutorizado() {
        return autorizado;
    }

    public void setAutorizado(Boolean autorizado) {
        this.autorizado = autorizado;
    }

    public LocalDateTime getDataEntrada() {
        return dataEntrada;
    }
}