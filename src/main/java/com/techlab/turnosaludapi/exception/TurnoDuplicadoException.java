package com.techlab.turnosaludapi.exception;

public class TurnoDuplicadoException extends RuntimeException {

    public TurnoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}