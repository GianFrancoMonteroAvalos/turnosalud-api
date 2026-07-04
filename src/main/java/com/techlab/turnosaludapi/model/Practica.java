package com.techlab.turnosaludapi.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "practicas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Practica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de la práctica es obligatorio")
    @Column(name = "nombre", nullable = false, length = 200)
    private String nombre;

    @NotBlank(message = "La modalidad es obligatoria")
    @Column(name = "modalidad", nullable = false, length = 10)
    private String modalidad;

    @NotNull(message = "La duración es obligatoria")
    @Min(value = 5, message = "La duración debe ser de al menos 5 minutos")
    @Column(name = "duracion_minutos", nullable = false)
    private Integer duracionMinutos;
}