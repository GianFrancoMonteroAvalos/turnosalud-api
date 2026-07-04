package com.techlab.turnosaludapi.exception;

public class TurnoNoEncontradoException extends RuntimeException {

    public TurnoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}