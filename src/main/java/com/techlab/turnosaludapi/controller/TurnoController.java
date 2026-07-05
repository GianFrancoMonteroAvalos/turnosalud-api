package com.techlab.turnosaludapi.controller;

import com.techlab.turnosaludapi.dto.TurnoRequest;
import com.techlab.turnosaludapi.model.EstadoTurno;
import com.techlab.turnosaludapi.model.Turno;
import com.techlab.turnosaludapi.service.TurnoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
@RestController
@RequestMapping("/turnos")
public class TurnoController {

    private final TurnoService service;

    public TurnoController(TurnoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Turno>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Turno> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Turno> crear(
            @Valid @RequestBody TurnoRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Turno> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TurnoRequest request
    ) {
        return ResponseEntity.ok(
                service.actualizar(id, request)
        );
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Turno> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoTurno estado
    ) {
        return ResponseEntity.ok(
                service.cambiarEstado(id, estado)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}