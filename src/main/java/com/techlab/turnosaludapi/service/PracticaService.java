package com.techlab.turnosaludapi.service;

import com.techlab.turnosaludapi.exception.PracticaNoEncontradaException;
import com.techlab.turnosaludapi.model.Practica;
import com.techlab.turnosaludapi.repository.PracticaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PracticaService {

    private final PracticaRepository repository;

    public PracticaService(PracticaRepository repository) {
        this.repository = repository;
    }

    public List<Practica> listarTodas() {
        return repository.findAll();
    }

    public Practica buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new PracticaNoEncontradaException(
                                "No se encontró la práctica con ID: " + id
                        )
                );
    }

    public Practica crear(Practica practica) {
        return repository.save(practica);
    }

    public Practica actualizar(Long id, Practica datosNuevos) {
        Practica practicaExistente = buscarPorId(id);

        practicaExistente.setNombre(datosNuevos.getNombre());
        practicaExistente.setModalidad(datosNuevos.getModalidad());
        practicaExistente.setDuracionMinutos(
                datosNuevos.getDuracionMinutos()
        );

        return repository.save(practicaExistente);
    }

    public void eliminar(Long id) {
        Practica practicaExistente = buscarPorId(id);
        repository.delete(practicaExistente);
    }
}