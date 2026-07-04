package com.techlab.turnosaludapi.exception;

public class DocumentoDuplicadoException extends RuntimeException {

    public DocumentoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}