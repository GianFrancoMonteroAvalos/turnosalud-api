package com.techlab.turnosaludapi.repository;

import com.techlab.turnosaludapi.model.Practica;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PracticaRepository extends JpaRepository<Practica, Long> {
}