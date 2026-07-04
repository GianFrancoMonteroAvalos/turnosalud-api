package com.techlab.turnosaludapi.service;

import com.techlab.turnosaludapi.exception.DocumentoDuplicadoException;
import com.techlab.turnosaludapi.exception.PacienteNoEncontradoException;
import com.techlab.turnosaludapi.model.Paciente;
import com.techlab.turnosaludapi.repository.PacienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PacienteService {

    private final PacienteRepository repository;

    public PacienteService(PacienteRepository repository) {
        this.repository = repository;
    }

    public List<Paciente> listarTodos() {
        return repository.findAll();
    }

    public Paciente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new PacienteNoEncontradoException(
                                "No se encontró el paciente con ID: " + id
                        )
                );
    }

    public Paciente buscarPorDocumento(String documento) {
        return repository.findByDocumento(documento)
                .orElseThrow(() ->
                        new PacienteNoEncontradoException(
                                "No se encontró un paciente con documento: " + documento
                        )
                );
    }

    public Paciente crear(Paciente paciente) {
        if (repository.existsByDocumento(paciente.getDocumento())) {
            throw new DocumentoDuplicadoException(
                    "Ya existe un paciente con documento: " + paciente.getDocumento()
            );
        }

        return repository.save(paciente);
    }

    public Paciente actualizar(Long id, Paciente datosNuevos) {
        Paciente pacienteExistente = buscarPorId(id);

        boolean cambioDocumento =
                !pacienteExistente.getDocumento().equals(datosNuevos.getDocumento());

        if (cambioDocumento && repository.existsByDocumento(datosNuevos.getDocumento())) {
            throw new DocumentoDuplicadoException(
                    "Ya existe un paciente con documento: " + datosNuevos.getDocumento()
            );
        }

        pacienteExistente.setNombre(datosNuevos.getNombre());
        pacienteExistente.setApellido(datosNuevos.getApellido());
        pacienteExistente.setDocumento(datosNuevos.getDocumento());
        pacienteExistente.setEmail(datosNuevos.getEmail());
        pacienteExistente.setTelefono(datosNuevos.getTelefono());

        return repository.save(pacienteExistente);
    }

    public void eliminar(Long id) {
        Paciente paciente = buscarPorId(id);
        repository.delete(paciente);
    }
}