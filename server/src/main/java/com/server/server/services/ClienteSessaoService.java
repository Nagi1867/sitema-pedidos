package com.server.server.services;

import com.server.server.entities.ClienteSessao;
import com.server.server.entities.Comanda;
import com.server.server.entities.enums.StatusComanda;
import com.server.server.repositories.ClienteSessaoRepository;
import com.server.server.repositories.ComandaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Service
public class ClienteSessaoService {

    private final ClienteSessaoRepository clienteSessaoRepository;
    private final ComandaRepository comandaRepository;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public ClienteSessaoService(
            ClienteSessaoRepository clienteSessaoRepository,
            ComandaRepository comandaRepository
    ) {
        this.clienteSessaoRepository = clienteSessaoRepository;
        this.comandaRepository = comandaRepository;
    }

    @Transactional(readOnly = true)
    public List<ClienteSessao> findAll() {
        return clienteSessaoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ClienteSessao findById(Long id) {
        return clienteSessaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sessão do cliente não encontrada"));
    }

    @Transactional(readOnly = true)
    public ClienteSessao findByTokenAcesso(String tokenAcesso) {
        if (tokenAcesso == null || tokenAcesso.isBlank()) {
            throw new RuntimeException("Token de acesso não informado");
        }

        return clienteSessaoRepository.findByTokenAcesso(tokenAcesso)
                .orElseThrow(() -> new RuntimeException("Sessão do cliente não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<ClienteSessao> findByComanda(Long comandaId) {
        if (!comandaRepository.existsById(comandaId)) {
            throw new RuntimeException("Comanda não encontrada");
        }

        return clienteSessaoRepository.findByComandaId(comandaId);
    }

    @Transactional
    public ClienteSessao entrarNaComanda(Long comandaId, String nome) {
        if (nome == null || nome.isBlank()) {
            throw new RuntimeException("O nome do cliente é obrigatório");
        }

        nome = nome.trim();

        if (nome.length() > 80) {
            throw new RuntimeException("O nome deve ter no máximo 80 caracteres");
        }

        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new RuntimeException("Comanda não encontrada"));

        if (comanda.getStatus() != StatusComanda.ABERTA) {
            throw new RuntimeException("Não é possível entrar em uma comanda que não está aberta");
        }

        ClienteSessao clienteSessao = new ClienteSessao();
        clienteSessao.setComanda(comanda);
        clienteSessao.setNome(nome);
        clienteSessao.setTokenAcesso(gerarTokenAcesso());
        clienteSessao.setAutorizado(false);

        return clienteSessaoRepository.save(clienteSessao);
    }

    @Transactional
    public ClienteSessao alterarAutorizacao(Long id, Boolean autorizado) {
        if (autorizado == null) {
            throw new RuntimeException("O estado de autorização deve ser informado");
        }

        ClienteSessao clienteSessao = findById(id);

        if (clienteSessao.getComanda().getStatus() != StatusComanda.ABERTA) {
            throw new RuntimeException("Só é possível alterar a autorização durante uma comanda aberta");
        }

        clienteSessao.setAutorizado(autorizado);

        return clienteSessaoRepository.save(clienteSessao);
    }

    @Transactional
    public void delete(Long id) {
        ClienteSessao clienteSessao = findById(id);
        clienteSessaoRepository.delete(clienteSessao);
    }

    private String gerarTokenAcesso() {
        String token;

        do {
            byte[] bytes = new byte[32];
            SECURE_RANDOM.nextBytes(bytes);

            token = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(bytes);

        } while (clienteSessaoRepository.existsByTokenAcesso(token));

        return token;
    }
}