package com.techlab.turnosaludapi.controller;

import com.techlab.turnosaludapi.model.Paciente;
import com.techlab.turnosaludapi.service.PacienteService;
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
@RequestMapping("/pacientes")
public class PacienteController {

    private final PacienteService service;

    public PacienteController(PacienteService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Paciente>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/documento/{documento}")
    public ResponseEntity<Paciente> buscarPorDocumento(
            @PathVariable String documento
    ) {
        return ResponseEntity.ok(
                service.buscarPorDocumento(documento)
        );
    }

    @PostMapping
    public ResponseEntity<Paciente> crear(
            @Valid @RequestBody Paciente paciente
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.crear(paciente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Paciente> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody Paciente paciente
    ) {
        return ResponseEntity.ok(
                service.actualizar(id, paciente)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}