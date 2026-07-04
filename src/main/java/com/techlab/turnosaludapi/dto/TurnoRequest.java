package com.techlab.turnosaludapi.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record TurnoRequest(

        @NotNull(message = "El paciente es obligatorio")
        Long pacienteId,

        @NotNull(message = "La fecha es obligatoria")
        @FutureOrPresent(message = "La fecha no puede ser anterior al día actual")
        LocalDate fecha,

        @NotNull(message = "La hora es obligatoria")
        LocalTime hora,

        @NotEmpty(message = "Debe seleccionar al menos una práctica")
        Set<Long> practicaIds
) {
}