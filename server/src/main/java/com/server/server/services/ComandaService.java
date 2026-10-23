package com.server.server.services;

import com.server.server.entities.Comanda;
import com.server.server.entities.Mesa;
import com.server.server.entities.enums.StatusComanda;
import com.server.server.repositories.ComandaRepository;
import com.server.server.repositories.MesaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Service
public class ComandaService {

    private final ComandaRepository comandaRepository;
    private final MesaRepository mesaRepository;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public ComandaService(
            ComandaRepository comandaRepository,
            MesaRepository mesaRepository
    ) {
        this.comandaRepository = comandaRepository;
        this.mesaRepository = mesaRepository;
    }

    @Transactional(readOnly = true)
    public List<Comanda> findAll() {
        return comandaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Comanda findById(Long id) {
        return comandaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comanda não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<Comanda> findByMesa(Long mesaId) {
        if (!mesaRepository.existsById(mesaId)) {
            throw new RuntimeException("Mesa não encontrada");
        }

        return comandaRepository.findByMesaId(mesaId);
    }

    @Transactional(readOnly = true)
    public Comanda findByCodigoAcesso(String codigoAcesso) {
        return comandaRepository.findByCodigoAcesso(codigoAcesso)
                .orElseThrow(() -> new RuntimeException("Comanda não encontrada"));
    }

    @Transactional
    public Comanda abrirComanda(Long mesaId) {
        Mesa mesa = mesaRepository.findById(mesaId)
                .orElseThrow(() -> new RuntimeException("Mesa não encontrada"));

        if (!Boolean.TRUE.equals(mesa.getAtiva())) {
            throw new RuntimeException("Não é possível abrir uma comanda para uma mesa inativa");
        }

        if (comandaRepository.findByMesaIdAndStatus(
                mesaId,
                StatusComanda.ABERTA
        ).isPresent()) {
            throw new RuntimeException("A mesa já possui uma comanda aberta");
        }

        Comanda comanda = new Comanda();
        comanda.setMesa(mesa);
        comanda.setCodigoAcesso(gerarCodigoAcesso());
        comanda.setStatus(StatusComanda.ABERTA);
        comanda.setValorTotal(BigDecimal.ZERO);

        return comandaRepository.save(comanda);
    }

    @Transactional
    public Comanda fecharComanda(Long id) {
        Comanda comanda = findById(id);

        if (comanda.getStatus() != StatusComanda.ABERTA) {
            throw new RuntimeException("A comanda não está aberta");
        }

        comanda.setStatus(StatusComanda.FECHADA);
        comanda.setDataFechamento(java.time.LocalDateTime.now());

        return comandaRepository.save(comanda);
    }

    private String gerarCodigoAcesso() {
        String codigo;

        do {
            byte[] bytes = new byte[32];
            SECURE_RANDOM.nextBytes(bytes);

            codigo = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(bytes);

        } while (comandaRepository.existsByCodigoAcesso(codigo));

        return codigo;
    }
}