package com.techlab.turnosaludapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PracticaNoEncontradaException.class)
    public ResponseEntity<Map<String, Object>> manejarPracticaNoEncontrada(
            PracticaNoEncontradaException exception
    ) {
        Map<String, Object> respuesta = new HashMap<>();

        respuesta.put("timestamp", LocalDateTime.now());
        respuesta.put("status", HttpStatus.NOT_FOUND.value());
        respuesta.put("error", "Not Found");
        respuesta.put("mensaje", exception.getMessage());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(respuesta);
    }


@ExceptionHandler(PacienteNoEncontradoException.class)
public ResponseEntity<Map<String, Object>> manejarPacienteNoEncontrado(
        PacienteNoEncontradoException exception
) {
    Map<String, Object> respuesta = new HashMap<>();

    respuesta.put("timestamp", LocalDateTime.now());
    respuesta.put("status", HttpStatus.NOT_FOUND.value());
    respuesta.put("error", "Not Found");
    respuesta.put("mensaje", exception.getMessage());

    return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(respuesta);
}

@ExceptionHandler(DocumentoDuplicadoException.class)
public ResponseEntity<Map<String, Object>> manejarDocumentoDuplicado(
        DocumentoDuplicadoException exception
) {
    Map<String, Object> respuesta = new HashMap<>();

    respuesta.put("timestamp", LocalDateTime.now());
    respuesta.put("status", HttpStatus.CONFLICT.value());
    respuesta.put("error", "Conflict");
    respuesta.put("mensaje", exception.getMessage());

    return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(respuesta);
}

@ExceptionHandler(TurnoNoEncontradoException.class)
public ResponseEntity<Map<String, Object>> manejarTurnoNoEncontrado(
        TurnoNoEncontradoException exception
) {
    Map<String, Object> respuesta = new HashMap<>();

    respuesta.put("timestamp", LocalDateTime.now());
    respuesta.put("status", HttpStatus.NOT_FOUND.value());
    respuesta.put("error", "Not Found");
    respuesta.put("mensaje", exception.getMessage());

    return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(respuesta);
}

@ExceptionHandler(TurnoDuplicadoException.class)
public ResponseEntity<Map<String, Object>> manejarTurnoDuplicado(
        TurnoDuplicadoException exception
) {
    Map<String, Object> respuesta = new HashMap<>();

    respuesta.put("timestamp", LocalDateTime.now());
    respuesta.put("status", HttpStatus.CONFLICT.value());
    respuesta.put("error", "Conflict");
    respuesta.put("mensaje", exception.getMessage());

    return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(respuesta);
}
}