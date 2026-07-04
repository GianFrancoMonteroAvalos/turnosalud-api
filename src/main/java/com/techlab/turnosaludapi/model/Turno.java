package com.techlab.turnosaludapi.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "turnos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalTime hora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoTurno estado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToMany
    @JoinTable(
        name = "turno_practica",
        joinColumns = @JoinColumn(name = "turno_id"),
        inverseJoinColumns = @JoinColumn(name = "practica_id")
    )
    private Set<Practica> practicas = new HashSet<>();

    public int calcularDuracionTotal() {
        return practicas.stream()
                .mapToInt(Practica::getDuracionMinutos)
                .sum();
    }
}