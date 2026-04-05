import {
  crearTurno,
  listarTurnos,
  listarTurnosPorEspecialista,
} from "../services/TurnoService.js";

export async function crearTurnoController(req, res, next) {
  try {
    const turno = await crearTurno(req.body);
    res.status(201).json(turno);
  } catch (error) {
    next(error);
  }
}

export async function listarTurnosController(req, res, next) {
  try {
    const turnos = await listarTurnos();
    res.json(turnos);
  } catch (error) {
    next(error);
  }
}

export async function listarTurnosPorEspecialistaController(req, res, next) {
  try {
    const { especialistaId } = req.params;
    const turnos = await listarTurnosPorEspecialista(especialistaId);
    res.json(turnos);
  } catch (error) {
    next(error);
  }
}