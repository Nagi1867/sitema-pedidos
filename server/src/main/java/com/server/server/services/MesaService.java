package com.server.server.services;

import com.server.server.entities.Mesa;
import com.server.server.repositories.MesaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MesaService {

    private final MesaRepository mesaRepository;

    public MesaService(MesaRepository mesaRepository) {
        this.mesaRepository = mesaRepository;
    }

    @Transactional(readOnly = true)
    public List<Mesa> findAll() {
        return mesaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Mesa findById(Long id) {
        return mesaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mesa não encontrada"));
    }

    @Transactional
    public Mesa create(Mesa mesa) {
        if (mesa.getNumero() == null || mesa.getNumero() <= 0) {
            throw new RuntimeException("O número da mesa deve ser maior que zero");
        }

        if (mesaRepository.existsByNumero(mesa.getNumero())) {
            throw new RuntimeException("Já existe uma mesa com esse número");
        }

        mesa.setAtiva(true);

        return mesaRepository.save(mesa);
    }

    @Transactional
    public Mesa update(Long id, Mesa mesaAtualizada) {
        Mesa mesa = findById(id);

        if (mesaAtualizada.getNumero() == null || mesaAtualizada.getNumero() <= 0) {
            throw new RuntimeException("O número da mesa deve ser maior que zero");
        }

        boolean numeroEmUso = mesaRepository.existsByNumero(mesaAtualizada.getNumero());

        if (numeroEmUso && !mesa.getNumero().equals(mesaAtualizada.getNumero())) {
            throw new RuntimeException("Já existe uma mesa com esse número");
        }

        mesa.setNumero(mesaAtualizada.getNumero());

        return mesaRepository.save(mesa);
    }

    @Transactional
    public Mesa alterarAtividade(Long id, Boolean ativa) {
        if (ativa == null) {
            throw new RuntimeException("A situação da mesa deve ser informada");
        }

        Mesa mesa = findById(id);
        mesa.setAtiva(ativa);

        return mesaRepository.save(mesa);
    }

    @Transactional
    public void delete(Long id) {
        Mesa mesa = findById(id);
        mesaRepository.delete(mesa);
    }
}