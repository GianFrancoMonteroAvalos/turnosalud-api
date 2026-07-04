package com.techlab.turnosaludapi.exception;

public class PracticaNoEncontradaException extends RuntimeException {

    public PracticaNoEncontradaException(String mensaje) {
        super(mensaje);
    }
}