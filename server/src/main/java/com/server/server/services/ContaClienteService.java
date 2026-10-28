package com.server.server.services;

import com.server.server.dto.ContaClienteDTO;
import com.server.server.dto.RegistrarPagamentoDTO;
import com.server.server.entities.ClienteSessao;
import com.server.server.entities.Comanda;
import com.server.server.entities.DivisaoItem;
import com.server.server.entities.ItemPedido;
import com.server.server.entities.PagamentoCliente;
import com.server.server.entities.Pedido;
import com.server.server.entities.enums.StatusComanda;
import com.server.server.entities.enums.StatusPedido;
import com.server.server.repositories.ClienteSessaoRepository;
import com.server.server.repositories.ComandaRepository;
import com.server.server.repositories.DivisaoItemRepository;
import com.server.server.repositories.PagamentoClienteRepository;
import com.server.server.repositories.PedidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class ContaClienteService {

    private static final BigDecimal ZERO = new BigDecimal("0.00");

    private final ClienteSessaoRepository clienteSessaoRepository;
    private final ComandaRepository comandaRepository;
    private final PedidoRepository pedidoRepository;
    private final DivisaoItemRepository divisaoItemRepository;
    private final PagamentoClienteRepository pagamentoClienteRepository;

    public ContaClienteService(
            ClienteSessaoRepository clienteSessaoRepository,
            ComandaRepository comandaRepository,
            PedidoRepository pedidoRepository,
            DivisaoItemRepository divisaoItemRepository,
            PagamentoClienteRepository pagamentoClienteRepository
    ) {
        this.clienteSessaoRepository = clienteSessaoRepository;
        this.comandaRepository = comandaRepository;
        this.pedidoRepository = pedidoRepository;
        this.divisaoItemRepository = divisaoItemRepository;
        this.pagamentoClienteRepository = pagamentoClienteRepository;
    }

    @Transactional(readOnly = true)
    public List<ContaClienteDTO> listarContas(Long comandaId) {
        Comanda comanda = buscarComanda(comandaId);

        List<ClienteSessao> participantes =
                clienteSessaoRepository.findByComandaId(comandaId);

        List<ContaClienteDTO> contas = new ArrayList<>();

        for (ClienteSessao participante : participantes) {
            contas.add(calcularConta(comanda, participante));
        }

        return contas;
    }

    @Transactional(readOnly = true)
    public ContaClienteDTO consultarConta(Long comandaId, Long clienteSessaoId) {
        Comanda comanda = buscarComanda(comandaId);
        ClienteSessao participante = buscarParticipante(comandaId, clienteSessaoId);

        return calcularConta(comanda, participante);
    }

    @Transactional
    public ContaClienteDTO registrarPagamento(
            Long comandaId,
            Long clienteSessaoId,
            RegistrarPagamentoDTO requisicao
    ) {
        if (requisicao == null || requisicao.valor() == null) {
            throw new RuntimeException("Informe o valor do pagamento");
        }

        BigDecimal valor = requisicao.valor();

        if (valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("O valor do pagamento deve ser maior que zero");
        }

        if (valor.scale() > 2) {
            throw new RuntimeException("O valor deve possuir no máximo duas casas decimais");
        }

        Comanda comanda = buscarComanda(comandaId);

        if (comanda.getStatus() != StatusComanda.ABERTA
                && comanda.getStatus() != StatusComanda.AGUARDANDO_PAGAMENTO) {
            throw new RuntimeException("Não é possível registrar pagamento nesta comanda");
        }

        ClienteSessao participante = buscarParticipante(comandaId, clienteSessaoId);
        ContaClienteDTO contaAtual = calcularConta(comanda, participante);

        if (valor.compareTo(contaAtual.saldoPendente()) > 0) {
            throw new RuntimeException("O pagamento não pode ser maior que o saldo pendente");
        }

        PagamentoCliente pagamento = new PagamentoCliente();
        pagamento.setClienteSessao(participante);
        pagamento.setValor(valor.setScale(2, RoundingMode.UNNECESSARY));

        pagamentoClienteRepository.save(pagamento);

        return calcularConta(comanda, participante);
    }

    @Transactional(readOnly = true)
    public boolean todosPagos(Long comandaId) {
        Comanda comanda = buscarComanda(comandaId);

        List<ClienteSessao> participantes =
                clienteSessaoRepository.findByComandaId(comandaId);

        for (ClienteSessao participante : participantes) {
            ContaClienteDTO conta = calcularConta(comanda, participante);

            if (conta.saldoPendente().compareTo(BigDecimal.ZERO) > 0) {
                return false;
            }
        }

        return true;
    }

    private ContaClienteDTO calcularConta(
            Comanda comanda,
            ClienteSessao participante
    ) {
        BigDecimal total = ZERO;
        List<ContaClienteDTO.ItemContaDTO> itens = new ArrayList<>();

        List<Pedido> pedidos = pedidoRepository.findByComandaId(comanda.getId());

        for (Pedido pedido : pedidos) {
            if (!pedidoValido(pedido.getStatus())) {
                continue;
            }

            for (ItemPedido item : pedido.getItens()) {
                BigDecimal valorItem = item.getPrecoUnitario()
                        .multiply(BigDecimal.valueOf(item.getQuantidade()));

                List<DivisaoItem> divisoes =
                        divisaoItemRepository.findByItemPedidoId(item.getId());

                BigDecimal responsabilidade = ZERO;
                boolean compartilhado = !divisoes.isEmpty();

                if (!compartilhado) {
                    if (pedido.getClienteSessao().getId().equals(participante.getId())) {
                        responsabilidade = valorItem;
                    }
                } else {
                    BigDecimal totalDividido = ZERO;

                    for (DivisaoItem divisao : divisoes) {
                        totalDividido = totalDividido.add(
                                divisao.getValorResponsabilidade()
                        );

                        if (divisao.getClienteSessao().getId()
                                .equals(participante.getId())) {
                            responsabilidade = responsabilidade.add(
                                    divisao.getValorResponsabilidade()
                            );
                        }
                    }

                    if (pedido.getClienteSessao().getId().equals(participante.getId())) {
                        BigDecimal restante = valorItem.subtract(totalDividido);

                        if (restante.compareTo(BigDecimal.ZERO) > 0) {
                            responsabilidade = responsabilidade.add(restante);
                        }
                    }
                }

                if (responsabilidade.compareTo(BigDecimal.ZERO) > 0) {
                    total = total.add(responsabilidade);

                    itens.add(new ContaClienteDTO.ItemContaDTO(
                            item.getId(),
                            item.getProduto().getNome(),
                            item.getQuantidade(),
                            item.getPrecoUnitario(),
                            responsabilidade.setScale(2, RoundingMode.HALF_UP),
                            compartilhado
                    ));
                }
            }
        }

        BigDecimal pago = pagamentoClienteRepository
                .findByClienteSessaoId(participante.getId())
                .stream()
                .map(PagamentoCliente::getValor)
                .reduce(ZERO, BigDecimal::add);

        BigDecimal saldo = total.subtract(pago);

        if (saldo.compareTo(BigDecimal.ZERO) < 0) {
            saldo = ZERO;
        }

        total = total.setScale(2, RoundingMode.HALF_UP);
        pago = pago.setScale(2, RoundingMode.HALF_UP);
        saldo = saldo.setScale(2, RoundingMode.HALF_UP);

        return new ContaClienteDTO(
                participante.getId(),
                participante.getNome(),
                total,
                pago,
                saldo,
                saldo.compareTo(BigDecimal.ZERO) == 0,
                itens
        );
    }

    private boolean pedidoValido(StatusPedido status) {
        return status == StatusPedido.CONFIRMADO
                || status == StatusPedido.EM_PREPARACAO
                || status == StatusPedido.PRONTO
                || status == StatusPedido.ENTREGUE;
    }

    private Comanda buscarComanda(Long comandaId) {
        return comandaRepository.findById(comandaId)
                .orElseThrow(() -> new RuntimeException("Comanda não encontrada"));
    }

    private ClienteSessao buscarParticipante(
            Long comandaId,
            Long clienteSessaoId
    ) {
        ClienteSessao participante = clienteSessaoRepository.findById(clienteSessaoId)
                .orElseThrow(() -> new RuntimeException("Participante não encontrado"));

        if (!participante.getComanda().getId().equals(comandaId)) {
            throw new RuntimeException("O participante não pertence a esta comanda");
        }

        return participante;
    }
}