package com.techlab.turnosaludapi.service;

import com.techlab.turnosaludapi.dto.TurnoRequest;
import com.techlab.turnosaludapi.exception.PracticaNoEncontradaException;
import com.techlab.turnosaludapi.exception.TurnoDuplicadoException;
import com.techlab.turnosaludapi.exception.TurnoNoEncontradoException;
import com.techlab.turnosaludapi.model.EstadoTurno;
import com.techlab.turnosaludapi.model.Paciente;
import com.techlab.turnosaludapi.model.Practica;
import com.techlab.turnosaludapi.model.Turno;
import com.techlab.turnosaludapi.repository.PracticaRepository;
import com.techlab.turnosaludapi.repository.TurnoRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class TurnoService {

    private final TurnoRepository turnoRepository;
    private final PacienteService pacienteService;
    private final PracticaRepository practicaRepository;

    public TurnoService(
            TurnoRepository turnoRepository,
            PacienteService pacienteService,
            PracticaRepository practicaRepository
    ) {
        this.turnoRepository = turnoRepository;
        this.pacienteService = pacienteService;
        this.practicaRepository = practicaRepository;
    }

    public List<Turno> listarTodos() {
        return turnoRepository.findAll();
    }

    public Turno buscarPorId(Long id) {
        return turnoRepository.findById(id)
                .orElseThrow(() ->
                        new TurnoNoEncontradoException(
                                "No se encontró el turno con ID: " + id
                        )
                );
    }

    public Turno crear(TurnoRequest request) {
        Paciente paciente = pacienteService.buscarPorId(request.pacienteId());

        validarTurnoDuplicado(
                paciente.getId(),
                request.fecha(),
                request.hora()
        );

        Set<Practica> practicas = buscarPracticas(request.practicaIds());

        Turno turno = new Turno();
        turno.setPaciente(paciente);
        turno.setFecha(request.fecha());
        turno.setHora(request.hora());
        turno.setEstado(EstadoTurno.ASIGNADO);
        turno.setPracticas(practicas);

        return turnoRepository.save(turno);
    }

    public Turno actualizar(Long id, TurnoRequest request) {
        Turno turno = buscarPorId(id);
        Paciente paciente = pacienteService.buscarPorId(request.pacienteId());

        boolean cambioHorario =
                !turno.getFecha().equals(request.fecha())
                || !turno.getHora().equals(request.hora())
                || !turno.getPaciente().getId().equals(request.pacienteId());

        if (cambioHorario) {
            validarTurnoDuplicado(
                    request.pacienteId(),
                    request.fecha(),
                    request.hora()
            );
        }

        turno.setPaciente(paciente);
        turno.setFecha(request.fecha());
        turno.setHora(request.hora());
        turno.setPracticas(buscarPracticas(request.practicaIds()));

        return turnoRepository.save(turno);
    }

    public Turno cambiarEstado(Long id, EstadoTurno nuevoEstado) {
        Turno turno = buscarPorId(id);

        if (turno.getEstado() == EstadoTurno.CANCELADO) {
            throw new IllegalArgumentException(
                    "No se puede modificar un turno cancelado"
            );
        }

        turno.setEstado(nuevoEstado);
        return turnoRepository.save(turno);
    }

    public void eliminar(Long id) {
        Turno turno = buscarPorId(id);
        turnoRepository.delete(turno);
    }

    private Set<Practica> buscarPracticas(Set<Long> ids) {
        List<Practica> practicasEncontradas =
                practicaRepository.findAllById(ids);

        if (practicasEncontradas.size() != ids.size()) {
            throw new PracticaNoEncontradaException(
                    "Una o más prácticas seleccionadas no existen"
            );
        }

        return new HashSet<>(practicasEncontradas);
    }

    private void validarTurnoDuplicado(
            Long pacienteId,
            java.time.LocalDate fecha,
            java.time.LocalTime hora
    ) {
        boolean existe = turnoRepository
                .existsByPacienteIdAndFechaAndHora(
                        pacienteId,
                        fecha,
                        hora
                );

        if (existe) {
            throw new TurnoDuplicadoException(
                    "El paciente ya posee un turno en esa fecha y horario"
            );
        }
    }
}