package com.server.server.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException exception
    ) {
        String mensagem = exception.getMessage() != null
                ? exception.getMessage()
                : "Ocorreu um erro na operação";

        HttpStatus status = determinarStatus(mensagem);

        Map<String, Object> resposta = Map.of(
                "dataHora", LocalDateTime.now(),
                "status", status.value(),
                "erro", status.getReasonPhrase(),
                "mensagem", mensagem
        );

        return ResponseEntity.status(status).body(resposta);
    }

    private HttpStatus determinarStatus(String mensagem) {
        String mensagemMinuscula = mensagem.toLowerCase();

        if (mensagemMinuscula.contains("não encontrado")
                || mensagemMinuscula.contains("nao encontrado")) {
            return HttpStatus.NOT_FOUND;
        }

        if (mensagemMinuscula.contains("não existe")
                || mensagemMinuscula.contains("nao existe")) {
            return HttpStatus.NOT_FOUND;
        }

        if (mensagemMinuscula.contains("já existe")
                || mensagemMinuscula.contains("ja existe")
                || mensagemMinuscula.contains("já possui")
                || mensagemMinuscula.contains("ja possui")) {
            return HttpStatus.CONFLICT;
        }

        return HttpStatus.BAD_REQUEST;
    }
}