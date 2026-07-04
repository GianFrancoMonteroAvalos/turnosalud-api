package com.techlab.turnosaludapi.repository;

import com.techlab.turnosaludapi.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;

public interface TurnoRepository extends JpaRepository<Turno, Long> {

    boolean existsByPacienteIdAndFechaAndHora(
            Long pacienteId,
            LocalDate fecha,
            LocalTime hora
    );
}