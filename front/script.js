// ============================================================
// TurnoSalud — Frontend
// API REST: http://localhost:8080
// ============================================================

const API_BASE = 'http://localhost:8080';

const ESTADOS_TURNO = ['ASIGNADO', 'CONFIRMADO', 'PRESENTE', 'CANCELADO'];

// Cache local para selects y checkboxes
let cachePacientes = [];
let cachePracticas = [];
let cacheTurnos = [];

// ============================================================
// Capa API
// ============================================================

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    };

    let response;
    try {
        response = await fetch(url, config);
    } catch {
        throw { tipo: 'red', mensaje: 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo en ' + API_BASE };
    }

    if (!response.ok) {
        let body = null;
        try { body = await response.json(); } catch { /* respuesta sin JSON */ }
        throw { tipo: 'http', status: response.status, body };
    }

    if (response.status === 204) return null;
    return response.json();
}

const api = {
    practicas: {
        listar: () => apiRequest('/practicas'),
        obtener: (id) => apiRequest(`/practicas/${id}`),
        crear: (data) => apiRequest('/practicas', { method: 'POST', body: JSON.stringify(data) }),
        actualizar: (id, data) => apiRequest(`/practicas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        eliminar: (id) => apiRequest(`/practicas/${id}`, { method: 'DELETE' })
    },
    pacientes: {
        listar: () => apiRequest('/pacientes'),
        obtener: (id) => apiRequest(`/pacientes/${id}`),
        buscarPorDocumento: (documento) => apiRequest(`/pacientes/documento/${encodeURIComponent(documento)}`),
        crear: (data) => apiRequest('/pacientes', { method: 'POST', body: JSON.stringify(data) }),
        actualizar: (id, data) => apiRequest(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        eliminar: (id) => apiRequest(`/pacientes/${id}`, { method: 'DELETE' })
    },
    turnos: {
        listar: () => apiRequest('/turnos'),
        obtener: (id) => apiRequest(`/turnos/${id}`),
        crear: (data) => apiRequest('/turnos', { method: 'POST', body: JSON.stringify(data) }),
        actualizar: (id, data) => apiRequest(`/turnos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        cambiarEstado: (id, estado) => apiRequest(`/turnos/${id}/estado?estado=${estado}`, { method: 'PATCH' }),
        eliminar: (id) => apiRequest(`/turnos/${id}`, { method: 'DELETE' })
    }
};

// ============================================================
// Manejo de errores y notificaciones
// ============================================================

function extraerMensajeError(error) {
    if (error.tipo === 'red') return error.mensaje;

    const { status, body } = error;

    if (body) {
        if (body.mensaje) return body.mensaje;
        if (body.message) return body.message;
        if (body.errors && Array.isArray(body.errors)) {
            return body.errors.map(e => e.defaultMessage || e.message).join('. ');
        }
        if (body.fieldErrors) {
            return Object.values(body.fieldErrors).flat().join('. ');
        }
    }

    const mensajes = {
        400: 'Solicitud inválida. Revisá los datos ingresados.',
        404: 'Recurso no encontrado.',
        409: 'Conflicto: el recurso ya existe o hay un duplicado.',
        500: 'Error interno del servidor. Intentá nuevamente.'
    };
    return mensajes[status] || `Error inesperado (${status}).`;
}

function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${tipo}`;
    toast.innerHTML = `
        <span class="toast__message">${escaparHtml(mensaje)}</span>
        <button class="toast__close" aria-label="Cerrar">&times;</button>
    `;
    toast.querySelector('.toast__close').addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function manejarError(error) {
    const mensaje = extraerMensajeError(error);
    const tipo = error.tipo === 'red' ? 'warning' : 'error';
    mostrarToast(mensaje, tipo);
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

// ============================================================
// Utilidades UI
// ============================================================

function $(id) { return document.getElementById(id); }

function nombreCompleto(paciente) {
    return `${paciente.nombre} ${paciente.apellido}`;
}

function badgeModalidad(modalidad) {
    const mod = (modalidad || '').toUpperCase();
    const clase = mod === 'RX' ? 'badge--rx' : 'badge--tc';
    return `<span class="badge ${clase}">${escaparHtml(mod)}</span>`;
}

function badgeEstado(estado) {
    const mapa = {
        ASIGNADO: 'badge--asignado',
        CONFIRMADO: 'badge--confirmado',
        PRESENTE: 'badge--presente',
        CANCELADO: 'badge--cancelado'
    };
    return `<span class="badge ${mapa[estado] || ''}">${escaparHtml(estado)}</span>`;
}

function formatearHora(hora) {
    if (!hora) return '—';
    return hora.substring(0, 5);
}

function calcularDuracionTurno(turno) {
    if (turno.calcularDuracionTotal != null) return turno.calcularDuracionTotal;
    const practicas = turno.practicas ? [...turno.practicas] : [];
    if (practicas.length === 0) return null;
    return practicas.reduce((sum, p) => sum + (p.duracionMinutos || 0), 0);
}

function limpiarErroresFormulario(prefix) {
    document.querySelectorAll(`[id^="error-${prefix}"]`).forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll(`#form-${prefix} .input--error`).forEach(el => {
        el.classList.remove('input--error');
    });
}

function mostrarErrorCampo(campoId, mensaje) {
    const input = $(campoId);
    const errorEl = $('error-' + campoId);
    if (input) input.classList.add('input--error');
    if (errorEl) errorEl.textContent = mensaje;
}

// Confirmación antes de eliminar (sin alert())
function confirmarAccion(mensaje, titulo = 'Confirmar eliminación') {
    return new Promise(resolve => {
        const dialog = $('confirm-dialog');
        $('confirm-title').textContent = titulo;
        $('confirm-message').textContent = mensaje;

        const onOk = () => { cleanup(); resolve(true); };
        const onCancel = () => { cleanup(); resolve(false); };

        function cleanup() {
            $('confirm-ok').removeEventListener('click', onOk);
            $('confirm-cancel').removeEventListener('click', onCancel);
            dialog.close();
        }

        $('confirm-ok').addEventListener('click', onOk);
        $('confirm-cancel').addEventListener('click', onCancel);
        dialog.showModal();
    });
}

// Navegación entre secciones
function initNavegacion() {
    document.querySelectorAll('.nav__btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            document.querySelectorAll('.nav__btn').forEach(b => b.classList.remove('nav__btn--active'));
            btn.classList.add('nav__btn--active');
            document.querySelectorAll('.section').forEach(s => {
                s.hidden = true;
                s.classList.remove('section--active');
            });
            const target = $(section);
            target.hidden = false;
            target.classList.add('section--active');

            if (section === 'dashboard') cargarDashboard();
            if (section === 'practicas') cargarPracticas();
            if (section === 'pacientes') cargarPacientes();
            if (section === 'turnos') cargarTurnos();
        });
    });
}

// Cerrar modales con botones [data-close-modal]
function initModales() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => btn.closest('dialog').close());
    });
}

// ============================================================
// Dashboard
// ============================================================

async function cargarDashboard() {
    try {
        const [pacientes, practicas, turnos] = await Promise.all([
            api.pacientes.listar(),
            api.practicas.listar(),
            api.turnos.listar()
        ]);
        $('stat-pacientes').textContent = pacientes.length;
        $('stat-practicas').textContent = practicas.length;
        $('stat-turnos').textContent = turnos.length;
    } catch (error) {
        manejarError(error);
        $('stat-pacientes').textContent = '—';
        $('stat-practicas').textContent = '—';
        $('stat-turnos').textContent = '—';
    }
}

// ============================================================
// Prácticas
// ============================================================

async function cargarPracticas() {
    const tbody = $('practicas-tbody');
    tbody.innerHTML = '<tr><td colspan="4" class="table__empty">Cargando...</td></tr>';
    try {
        cachePracticas = await api.practicas.listar();
        if (cachePracticas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="table__empty">No hay prácticas registradas.</td></tr>';
            return;
        }
        tbody.innerHTML = cachePracticas.map(p => `
            <tr>
                <td data-label="Nombre">${escaparHtml(p.nombre)}</td>
                <td data-label="Modalidad">${badgeModalidad(p.modalidad)}</td>
                <td data-label="Duración">${p.duracionMinutos} min</td>
                <td data-label="Acciones">
                    <div class="table__actions">
                        <button class="btn btn--ghost btn--sm" onclick="editarPractica(${p.id})">Editar</button>
                        <button class="btn btn--danger btn--sm" onclick="eliminarPractica(${p.id})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        manejarError(error);
        tbody.innerHTML = '<tr><td colspan="4" class="table__empty">Error al cargar prácticas.</td></tr>';
    }
}

function abrirModalPractica(practica = null) {
    limpiarErroresFormulario('practica');
    const modal = $('modal-practica');
    if (practica) {
        $('modal-practica-titulo').textContent = 'Editar práctica';
        $('practica-id').value = practica.id;
        $('practica-nombre').value = practica.nombre;
        $('practica-modalidad').value = practica.modalidad;
        $('practica-duracion').value = practica.duracionMinutos;
    } else {
        $('modal-practica-titulo').textContent = 'Nueva práctica';
        $('practica-id').value = '';
        $('form-practica').reset();
    }
    modal.showModal();
}

async function editarPractica(id) {
    try {
        const practica = await api.practicas.obtener(id);
        abrirModalPractica(practica);
    } catch (error) {
        manejarError(error);
    }
}

function validarPractica() {
    limpiarErroresFormulario('practica');
    let valido = true;
    const nombre = $('practica-nombre').value.trim();
    const modalidad = $('practica-modalidad').value;
    const duracion = parseInt($('practica-duracion').value, 10);

    if (!nombre) { mostrarErrorCampo('practica-nombre', 'El nombre es obligatorio.'); valido = false; }
    if (!modalidad) { mostrarErrorCampo('practica-modalidad', 'La modalidad es obligatoria.'); valido = false; }
    if (!duracion || duracion < 5) { mostrarErrorCampo('practica-duracion', 'La duración debe ser de al menos 5 minutos.'); valido = false; }

    return valido ? { nombre, modalidad, duracionMinutos: duracion } : null;
}

async function guardarPractica(e) {
    e.preventDefault();
    const datos = validarPractica();
    if (!datos) return;

    const id = $('practica-id').value;
    try {
        if (id) {
            await api.practicas.actualizar(id, datos);
            mostrarToast('Práctica actualizada correctamente.', 'success');
        } else {
            await api.practicas.crear(datos);
            mostrarToast('Práctica creada correctamente.', 'success');
        }
        $('modal-practica').close();
        cargarPracticas();
        cargarDashboard();
    } catch (error) {
        manejarError(error);
    }
}

async function eliminarPractica(id) {
    const practica = cachePracticas.find(p => p.id === id);
    const nombre = practica ? practica.nombre : 'esta práctica';
    const confirmado = await confirmarAccion(`¿Eliminar la práctica "${nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;
    try {
        await api.practicas.eliminar(id);
        mostrarToast('Práctica eliminada.', 'success');
        cargarPracticas();
        cargarDashboard();
    } catch (error) {
        manejarError(error);
    }
}

// ============================================================
// Pacientes
// ============================================================

async function cargarPacientes(lista = null) {
    const tbody = $('pacientes-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="table__empty">Cargando...</td></tr>';
    try {
        cachePacientes = lista ?? await api.pacientes.listar();
        if (cachePacientes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="table__empty">No hay pacientes registrados.</td></tr>';
            return;
        }
        tbody.innerHTML = cachePacientes.map(p => `
            <tr>
                <td data-label="Nombre">${escaparHtml(nombreCompleto(p))}</td>
                <td data-label="Documento">${escaparHtml(p.documento)}</td>
                <td data-label="Email">${escaparHtml(p.email || '—')}</td>
                <td data-label="Teléfono">${escaparHtml(p.telefono || '—')}</td>
                <td data-label="Acciones">
                    <div class="table__actions">
                        <button class="btn btn--ghost btn--sm" onclick="editarPaciente(${p.id})">Editar</button>
                        <button class="btn btn--danger btn--sm" onclick="eliminarPaciente(${p.id})">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        manejarError(error);
        tbody.innerHTML = '<tr><td colspan="5" class="table__empty">Error al cargar pacientes.</td></tr>';
    }
}

async function buscarPacientePorDocumento() {
    const documento = $('buscar-documento').value.trim();
    if (!documento) {
        mostrarToast('Ingresá un número de documento para buscar.', 'warning');
        return;
    }
    if (documento.length < 7 || documento.length > 10) {
        mostrarToast('El documento debe tener entre 7 y 10 caracteres.', 'warning');
        return;
    }
    const tbody = $('pacientes-tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="table__empty">Buscando...</td></tr>';
    try {
        const paciente = await api.pacientes.buscarPorDocumento(documento);
        cargarPacientes([paciente]);
        mostrarToast('Paciente encontrado.', 'success');
    } catch (error) {
        manejarError(error);
        tbody.innerHTML = '<tr><td colspan="5" class="table__empty">No se encontró el paciente.</td></tr>';
    }
}

function abrirModalPaciente(paciente = null) {
    limpiarErroresFormulario('paciente');
    const modal = $('modal-paciente');
    if (paciente) {
        $('modal-paciente-titulo').textContent = 'Editar paciente';
        $('paciente-id').value = paciente.id;
        $('paciente-nombre').value = paciente.nombre;
        $('paciente-apellido').value = paciente.apellido;
        $('paciente-documento').value = paciente.documento;
        $('paciente-email').value = paciente.email || '';
        $('paciente-telefono').value = paciente.telefono || '';
    } else {
        $('modal-paciente-titulo').textContent = 'Nuevo paciente';
        $('paciente-id').value = '';
        $('form-paciente').reset();
    }
    modal.showModal();
}

async function editarPaciente(id) {
    try {
        const paciente = await api.pacientes.obtener(id);
        abrirModalPaciente(paciente);
    } catch (error) {
        manejarError(error);
    }
}

function validarPaciente() {
    limpiarErroresFormulario('paciente');
    let valido = true;

    const nombre = $('paciente-nombre').value.trim();
    const apellido = $('paciente-apellido').value.trim();
    const documento = $('paciente-documento').value.trim();
    const email = $('paciente-email').value.trim();
    const telefono = $('paciente-telefono').value.trim();

    if (!nombre) { mostrarErrorCampo('paciente-nombre', 'El nombre es obligatorio.'); valido = false; }
    if (!apellido) { mostrarErrorCampo('paciente-apellido', 'El apellido es obligatorio.'); valido = false; }
    if (!documento) {
        mostrarErrorCampo('paciente-documento', 'El documento es obligatorio.');
        valido = false;
    } else if (documento.length < 7 || documento.length > 10) {
        mostrarErrorCampo('paciente-documento', 'El documento debe tener entre 7 y 10 caracteres.');
        valido = false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarErrorCampo('paciente-email', 'El email debe tener un formato válido.');
        valido = false;
    }

    return valido ? { nombre, apellido, documento, email: email || null, telefono: telefono || null } : null;
}

async function guardarPaciente(e) {
    e.preventDefault();
    const datos = validarPaciente();
    if (!datos) return;

    const id = $('paciente-id').value;
    try {
        if (id) {
            await api.pacientes.actualizar(id, datos);
            mostrarToast('Paciente actualizado correctamente.', 'success');
        } else {
            await api.pacientes.crear(datos);
            mostrarToast('Paciente creado correctamente.', 'success');
        }
        $('modal-paciente').close();
        cargarPacientes();
        cargarDashboard();
    } catch (error) {
        manejarError(error);
    }
}

async function eliminarPaciente(id) {
    const paciente = cachePacientes.find(p => p.id === id);
    const nombre = paciente ? nombreCompleto(paciente) : 'este paciente';
    const confirmado = await confirmarAccion(`¿Eliminar al paciente "${nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;
    try {
        await api.pacientes.eliminar(id);
        mostrarToast('Paciente eliminado.', 'success');
        cargarPacientes();
        cargarDashboard();
    } catch (error) {
        manejarError(error);
    }
}

// ============================================================
// Turnos
// ============================================================

async function cargarTurnos() {
    const tbody = $('turnos-tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="table__empty">Cargando...</td></tr>';
    try {
        cacheTurnos = await api.turnos.listar();
        if (cacheTurnos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="table__empty">No hay turnos registrados.</td></tr>';
            return;
        }
        tbody.innerHTML = cacheTurnos.map(t => renderFilaTurno(t)).join('');
    } catch (error) {
        manejarError(error);
        tbody.innerHTML = '<tr><td colspan="7" class="table__empty">Error al cargar turnos.</td></tr>';
    }
}

function renderFilaTurno(turno) {
    const pacienteNombre = turno.paciente ? nombreCompleto(turno.paciente) : '—';
    const practicasHtml = (turno.practicas || [])
        .map(p => badgeModalidad(p.modalidad) + ' ' + escaparHtml(p.nombre))
        .join('<br>') || '—';
    const duracionTotal = calcularDuracionTurno(turno);
    const duracion = duracionTotal != null ? `${duracionTotal} min` : '—';
    const cancelado = turno.estado === 'CANCELADO';

    const opcionesEstado = ESTADOS_TURNO.map(e =>
        `<option value="${e}" ${e === turno.estado ? 'selected' : ''}>${e}</option>`
    ).join('');

    return `
        <tr>
            <td data-label="Fecha">${escaparHtml(turno.fecha)}</td>
            <td data-label="Hora">${formatearHora(turno.hora)}</td>
            <td data-label="Paciente">${escaparHtml(pacienteNombre)}</td>
            <td data-label="Prácticas"><div class="practicas-list">${practicasHtml}</div></td>
            <td data-label="Duración">${duracion}</td>
            <td data-label="Estado">
                <select class="estado-select" ${cancelado ? 'disabled' : ''}
                    onchange="cambiarEstadoTurno(${turno.id}, this.value, this)">
                    ${opcionesEstado}
                </select>
            </td>
            <td data-label="Acciones">
                <div class="table__actions">
                    <button class="btn btn--ghost btn--sm" onclick="editarTurno(${turno.id})" ${cancelado ? 'disabled' : ''}>Editar</button>
                    <button class="btn btn--danger btn--sm" onclick="eliminarTurno(${turno.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `;
}

async function cambiarEstadoTurno(id, nuevoEstado, selectEl) {
    const turno = cacheTurnos.find(t => t.id === id);
    const estadoAnterior = turno ? turno.estado : selectEl.value;

    if (nuevoEstado === estadoAnterior) return;

    try {
        await api.turnos.cambiarEstado(id, nuevoEstado);
        mostrarToast(`Estado actualizado a ${nuevoEstado}.`, 'success');
        if (turno) turno.estado = nuevoEstado;
        if (nuevoEstado === 'CANCELADO') {
            selectEl.disabled = true;
            cargarTurnos();
        }
    } catch (error) {
        selectEl.value = estadoAnterior;
        manejarError(error);
    }
}

async function poblarSelectsTurno() {
    try {
        const [pacientes, practicas] = await Promise.all([
            api.pacientes.listar(),
            api.practicas.listar()
        ]);
        cachePacientes = pacientes;
        cachePracticas = practicas;

        const selectPaciente = $('turno-paciente');
        selectPaciente.innerHTML = '<option value="">Seleccionar paciente...</option>' +
            pacientes.map(p => `<option value="${p.id}">${escaparHtml(nombreCompleto(p))} (${escaparHtml(p.documento)})</option>`).join('');

        const checkboxes = $('turno-practicas-checkboxes');
        if (practicas.length === 0) {
            checkboxes.innerHTML = '<p style="color:var(--color-text-muted);font-size:0.85rem">No hay prácticas disponibles.</p>';
        } else {
            checkboxes.innerHTML = practicas.map(p => `
                <label class="checkbox-item">
                    <input type="checkbox" name="practicaIds" value="${p.id}">
                    ${badgeModalidad(p.modalidad)} ${escaparHtml(p.nombre)} (${p.duracionMinutos} min)
                </label>
            `).join('');
        }
    } catch (error) {
        manejarError(error);
    }
}

async function abrirModalTurno(turno = null) {
    limpiarErroresFormulario('turno');
    await poblarSelectsTurno();

    const modal = $('modal-turno');
    const hoy = new Date().toISOString().split('T')[0];
    $('turno-fecha').min = hoy;

    if (turno) {
        $('modal-turno-titulo').textContent = 'Editar turno';
        $('turno-id').value = turno.id;
        $('turno-paciente').value = turno.paciente?.id || '';
        $('turno-fecha').value = turno.fecha;
        $('turno-hora').value = formatearHora(turno.hora);

        const idsPracticas = (turno.practicas || []).map(p => String(p.id));
        document.querySelectorAll('input[name="practicaIds"]').forEach(cb => {
            cb.checked = idsPracticas.includes(cb.value);
        });
    } else {
        $('modal-turno-titulo').textContent = 'Nuevo turno';
        $('turno-id').value = '';
        $('form-turno').reset();
        $('turno-fecha').min = hoy;
    }
    modal.showModal();
}

async function editarTurno(id) {
    try {
        const turno = await api.turnos.obtener(id);
        if (turno.estado === 'CANCELADO') {
            mostrarToast('No se puede editar un turno cancelado.', 'warning');
            return;
        }
        abrirModalTurno(turno);
    } catch (error) {
        manejarError(error);
    }
}

function validarTurno() {
    limpiarErroresFormulario('turno');
    let valido = true;

    const pacienteId = $('turno-paciente').value;
    const fecha = $('turno-fecha').value;
    const hora = $('turno-hora').value;
    const practicaIds = [...document.querySelectorAll('input[name="practicaIds"]:checked')]
        .map(cb => parseInt(cb.value, 10));

    if (!pacienteId) { mostrarErrorCampo('turno-paciente', 'El paciente es obligatorio.'); valido = false; }
    if (!fecha) { mostrarErrorCampo('turno-fecha', 'La fecha es obligatoria.'); valido = false; }
    else {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaSeleccionada = new Date(fecha + 'T00:00:00');
        if (fechaSeleccionada < hoy) {
            mostrarErrorCampo('turno-fecha', 'La fecha no puede ser anterior al día actual.');
            valido = false;
        }
    }
    if (!hora) { mostrarErrorCampo('turno-hora', 'La hora es obligatoria.'); valido = false; }
    if (practicaIds.length === 0) {
        $('error-turno-practicas').textContent = 'Debe seleccionar al menos una práctica.';
        valido = false;
    }

    return valido ? {
        pacienteId: parseInt(pacienteId, 10),
        fecha,
        hora,
        practicaIds
    } : null;
}

async function guardarTurno(e) {
    e.preventDefault();
    const datos = validarTurno();
    if (!datos) return;

    const id = $('turno-id').value;
    try {
        if (id) {
            await api.turnos.actualizar(id, datos);
            mostrarToast('Turno actualizado correctamente.', 'success');
        } else {
            await api.turnos.crear(datos);
            mostrarToast('Turno creado correctamente.', 'success');
        }
        $('modal-turno').close();
        cargarTurnos();
        cargarDashboard();
    } catch (error) {
        manejarError(error);
    }
}

async function eliminarTurno(id) {
    const confirmado = await confirmarAccion('¿Eliminar este turno? Esta acción no se puede deshacer.');
    if (!confirmado) return;
    try {
        await api.turnos.eliminar(id);
        mostrarToast('Turno eliminado.', 'success');
        cargarTurnos();
        cargarDashboard();
    } catch (error) {
        manejarError(error);
    }
}

// ============================================================
// Inicialización
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavegacion();
    initModales();

    $('btn-nueva-practica').addEventListener('click', () => abrirModalPractica());
    $('form-practica').addEventListener('submit', guardarPractica);

    $('btn-nuevo-paciente').addEventListener('click', () => abrirModalPaciente());
    $('form-paciente').addEventListener('submit', guardarPaciente);
    $('btn-buscar-documento').addEventListener('click', buscarPacientePorDocumento);
    $('btn-limpiar-busqueda').addEventListener('click', () => {
        $('buscar-documento').value = '';
        cargarPacientes();
    });
    $('buscar-documento').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); buscarPacientePorDocumento(); }
    });

    $('btn-nuevo-turno').addEventListener('click', () => abrirModalTurno());
    $('form-turno').addEventListener('submit', guardarTurno);

    cargarDashboard();
});

// Exponer funciones usadas desde onclick en el HTML
window.editarPractica = editarPractica;
window.eliminarPractica = eliminarPractica;
window.editarPaciente = editarPaciente;
window.eliminarPaciente = eliminarPaciente;
window.editarTurno = editarTurno;
window.eliminarTurno = eliminarTurno;
window.cambiarEstadoTurno = cambiarEstadoTurno;
