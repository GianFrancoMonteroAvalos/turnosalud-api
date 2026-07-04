package com.techlab.turnosaludapi.controller;

import com.techlab.turnosaludapi.model.Practica;
import com.techlab.turnosaludapi.service.PracticaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/practicas")
public class PracticaController {

    private final PracticaService service;

    public PracticaController(PracticaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Practica>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Practica> buscarPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Practica> crear(
            @Valid @RequestBody Practica practica
    ) {
        Practica nuevaPractica = service.crear(practica);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nuevaPractica);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Practica> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Practica practica
    ) {
        return ResponseEntity.ok(
                service.actualizar(id, practica)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id
    ) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}