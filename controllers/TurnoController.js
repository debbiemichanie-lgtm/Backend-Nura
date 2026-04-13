import {
  crearTurno,
  listarTurnos,
  listarTurnosPorEspecialista,
  cancelarTurno,
  editarTurno,
  obtenerDisponibilidad,
} from "../services/TurnoService.js";

// ================= CREAR =================

export async function crearTurnoController(req, res, next) {
  try {
    const turno = await crearTurno(req.body);
    res.status(201).json({ ok: true, data: turno });
  } catch (error) {
    next(error);
  }
}

// ================= LISTAR =================

export async function listarTurnosController(req, res, next) {
  try {
    const turnos = await listarTurnos();
    res.json({ ok: true, data: turnos });
  } catch (error) {
    next(error);
  }
}

export async function listarTurnosPorEspecialistaController(req, res, next) {
  try {
    const { especialistaId } = req.params;
    const turnos = await listarTurnosPorEspecialista(especialistaId);
    res.json({ ok: true, data: turnos });
  } catch (error) {
    next(error);
  }
}

export async function obtenerDisponibilidadController(req, res, next) {
  try {
    const { especialistaId } = req.params;
    const { from, to } = req.query;

    const result = await obtenerDisponibilidad(especialistaId, from, to);
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}

// ================= CANCELAR =================

export async function cancelarTurnoController(req, res, next) {
  try {
    const { turnoId } = req.params;
    const turno = await cancelarTurno(turnoId);
    res.json({ ok: true, data: turno });
  } catch (error) {
    next(error);
  }
}

// ================= EDITAR =================

export async function editarTurnoController(req, res, next) {
  try {
    const { turnoId } = req.params;
    const turno = await editarTurno(turnoId, req.body);
    res.json({ ok: true, data: turno });
  } catch (error) {
    next(error);
  }
}