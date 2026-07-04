package com.techlab.turnosaludapi.exception;

public class PacienteNoEncontradoException extends RuntimeException {

    public PacienteNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}