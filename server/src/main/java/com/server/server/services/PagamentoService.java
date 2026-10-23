package com.server.server.services;

import com.server.server.entities.ClienteSessao;
import com.server.server.entities.Comanda;
import com.server.server.entities.Pagamento;
import com.server.server.entities.enums.MetodoPagamento;
import com.server.server.entities.enums.StatusComanda;
import com.server.server.entities.enums.StatusPagamento;
import com.server.server.repositories.ClienteSessaoRepository;
import com.server.server.repositories.ComandaRepository;
import com.server.server.repositories.PagamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final ComandaRepository comandaRepository;
    private final ClienteSessaoRepository clienteSessaoRepository;

    public PagamentoService(
            PagamentoRepository pagamentoRepository,
            ComandaRepository comandaRepository,
            ClienteSessaoRepository clienteSessaoRepository
    ) {
        this.pagamentoRepository = pagamentoRepository;
        this.comandaRepository = comandaRepository;
        this.clienteSessaoRepository = clienteSessaoRepository;
    }

    @Transactional(readOnly = true)
    public List<Pagamento> findAll() {
        return pagamentoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Pagamento findById(Long id) {
        return pagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Pagamento> findByComanda(Long comandaId) {
        if (!comandaRepository.existsById(comandaId)) {
            throw new RuntimeException("Comanda não encontrada");
        }

        return pagamentoRepository.findByComandaId(comandaId);
    }

    @Transactional(readOnly = true)
    public List<Pagamento> findByClienteSessao(Long clienteSessaoId) {
        if (!clienteSessaoRepository.existsById(clienteSessaoId)) {
            throw new RuntimeException("Sessão do cliente não encontrada");
        }

        return pagamentoRepository.findByClienteSessaoId(clienteSessaoId);
    }

    @Transactional(readOnly = true)
    public List<Pagamento> findByStatus(StatusPagamento status) {
        if (status == null) {
            throw new RuntimeException("O status do pagamento deve ser informado");
        }

        return pagamentoRepository.findByStatus(status);
    }

    @Transactional
    public Pagamento registrarPagamento(
            Long comandaId,
            Long clienteSessaoId,
            BigDecimal valor,
            MetodoPagamento metodo
    ) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor do pagamento deve ser maior que zero");
        }

        if (valor.scale() > 2) {
            throw new RuntimeException("O valor deve possuir no máximo duas casas decimais");
        }

        if (valor.precision() > 10) {
            throw new RuntimeException("O valor do pagamento é muito alto");
        }

        if (metodo == null) {
            throw new RuntimeException("O método de pagamento deve ser informado");
        }

        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new RuntimeException("Comanda não encontrada"));

        if (comanda.getStatus() != StatusComanda.ABERTA
                && comanda.getStatus() != StatusComanda.AGUARDANDO_PAGAMENTO) {
            throw new RuntimeException("A comanda não aceita novos pagamentos");
        }

        ClienteSessao clienteSessao = null;

        if (clienteSessaoId != null) {
            clienteSessao = clienteSessaoRepository.findById(clienteSessaoId)
                    .orElseThrow(() -> new RuntimeException("Sessão do cliente não encontrada"));

            if (!comandaId.equals(clienteSessao.getComanda().getId())) {
                throw new RuntimeException(
                        "O participante não pertence à comanda informada"
                );
            }
        }

        BigDecimal totalComanda = comanda.getValorTotal();

        if (totalComanda == null || totalComanda.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("A comanda não possui valores para pagamento");
        }

        BigDecimal totalPago = calcularTotalPago(comandaId);
        BigDecimal saldoRestante = totalComanda.subtract(totalPago);

        if (saldoRestante.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("A comanda já foi totalmente paga");
        }

        if (valor.compareTo(saldoRestante) > 0) {
            throw new RuntimeException(
                    "O pagamento excede o saldo restante de R$ " + saldoRestante
            );
        }

        Pagamento pagamento = new Pagamento();
        pagamento.setComanda(comanda);
        pagamento.setClienteSessao(clienteSessao);
        pagamento.setValor(valor);
        pagamento.setMetodo(metodo);
        pagamento.setStatus(StatusPagamento.PENDENTE);

        return pagamentoRepository.save(pagamento);
    }

    @Transactional
    public Pagamento confirmarPagamento(Long pagamentoId, String referenciaExterna) {
        Pagamento pagamento = findById(pagamentoId);

        if (pagamento.getStatus() != StatusPagamento.PENDENTE
                && pagamento.getStatus() != StatusPagamento.PROCESSANDO) {
            throw new RuntimeException(
                    "Somente pagamentos pendentes ou em processamento podem ser confirmados"
            );
        }

        if (referenciaExterna == null || referenciaExterna.isBlank()) {
            throw new RuntimeException(
                    "A referência da transação deve ser informada"
            );
        }

        if (referenciaExterna.length() > 150) {
            throw new RuntimeException(
                    "A referência deve ter no máximo 150 caracteres"
            );
        }

        Comanda comanda = pagamento.getComanda();

        if (comanda.getStatus() != StatusComanda.ABERTA
                && comanda.getStatus() != StatusComanda.AGUARDANDO_PAGAMENTO) {
            throw new RuntimeException(
                    "Não é possível confirmar o pagamento de uma comanda fechada"
            );
        }

        BigDecimal totalComanda = comanda.getValorTotal();
        BigDecimal totalPago = calcularTotalPago(comanda.getId());

        if (totalComanda == null
                || totalPago.add(pagamento.getValor()).compareTo(totalComanda) > 0) {
            throw new RuntimeException(
                    "A confirmação excederia o valor total da comanda"
            );
        }

        pagamento.setReferenciaExterna(referenciaExterna.trim());
        pagamento.setStatus(StatusPagamento.APROVADO);
        pagamento.setDataConfirmacao(LocalDateTime.now());

        return pagamentoRepository.save(pagamento);
    }

    @Transactional
    public Pagamento cancelarPagamento(Long pagamentoId) {
        Pagamento pagamento = findById(pagamentoId);

        if (pagamento.getStatus() != StatusPagamento.PENDENTE) {
            throw new RuntimeException(
                    "Somente pagamentos pendentes podem ser cancelados por este método"
            );
        }

        pagamento.setStatus(StatusPagamento.CANCELADO);

        return pagamentoRepository.save(pagamento);
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularTotalPago(Long comandaId) {
        if (!comandaRepository.existsById(comandaId)) {
            throw new RuntimeException("Comanda não encontrada");
        }

        List<Pagamento> pagamentos = pagamentoRepository.findByComandaIdAndStatus(
                comandaId,
                StatusPagamento.APROVADO
        );

        BigDecimal total = BigDecimal.ZERO;

        for (Pagamento pagamento : pagamentos) {
            if (pagamento.getValor() != null) {
                total = total.add(pagamento.getValor());
            }
        }

        return total;
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularSaldoRestante(Long comandaId) {
        Comanda comanda = comandaRepository.findById(comandaId)
                .orElseThrow(() -> new RuntimeException("Comanda não encontrada"));

        BigDecimal totalComanda = comanda.getValorTotal() == null
                ? BigDecimal.ZERO
                : comanda.getValorTotal();

        BigDecimal totalPago = calcularTotalPago(comandaId);
        BigDecimal saldoRestante = totalComanda.subtract(totalPago);

        return saldoRestante.max(BigDecimal.ZERO);
    }
}