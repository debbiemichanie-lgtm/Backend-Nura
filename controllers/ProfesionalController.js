import Especialista from "../models/EspecialistaModel.js";
import BloqueoAgenda from "../models/BloqueoAgendaModel.js";
import Turno from "../models/TurnoModel.js";
import { crearTurno, cancelarTurno } from "../services/TurnoService.js";

function getEspecialistaId(req) {
  const id = req.user?.especialistaId;
  if (!id) throw new Error("Este usuario profesional no tiene especialista vinculado");
  return id;
}

export async function getMiPerfilProfesional(req, res, next) {
  try {
    const especialista = await Especialista.findById(getEspecialistaId(req));
    res.json({ ok: true, data: especialista });
  } catch (error) {
    next(error);
  }
}

export async function getMiAgendaProfesional(req, res, next) {
  try {
    const especialistaId = getEspecialistaId(req);

    const [turnos, bloqueos] = await Promise.all([
      Turno.find({ especialistaId, status: "confirmed" }).sort({ start: 1 }),
      BloqueoAgenda.find({ especialistaId }).sort({ start: 1 }),
    ]);

    res.json({ ok: true, data: { turnos, bloqueos } });
  } catch (error) {
    next(error);
  }
}

export async function crearMiBloqueoProfesional(req, res, next) {
  try {
    const especialistaId = getEspecialistaId(req);
    const { start, end, motivo } = req.body;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate <= startDate) {
      return res.status(400).json({ ok: false, message: "Horario inválido" });
    }

    const turnoSolapado = await Turno.findOne({
      especialistaId,
      status: "confirmed",
      start: { $lt: endDate },
      end: { $gt: startDate },
    });

    if (turnoSolapado) {
      return res.status(400).json({ ok: false, message: "Ese horario ya tiene un turno" });
    }

    const bloqueoSolapado = await BloqueoAgenda.findOne({
      especialistaId,
      start: { $lt: endDate },
      end: { $gt: startDate },
    });

    if (bloqueoSolapado) {
      return res.status(400).json({ ok: false, message: "Ese horario ya está bloqueado" });
    }

    const bloqueo = await BloqueoAgenda.create({
      especialistaId,
      start: startDate,
      end: endDate,
      motivo: motivo || "Bloqueado por profesional",
      tipo: "bloqueo",
    });

    res.status(201).json({ ok: true, data: bloqueo });
  } catch (error) {
    next(error);
  }
}

export async function crearMiTurnoProfesional(req, res, next) {
  try {
    const turno = await crearTurno({
      ...req.body,
      especialistaId: getEspecialistaId(req),
    });

    res.status(201).json({ ok: true, data: turno });
  } catch (error) {
    next(error);
  }
}

export async function cancelarMiTurnoProfesional(req, res, next) {
  try {
    const especialistaId = String(getEspecialistaId(req));
    const { turnoId } = req.params;

    const turno = await Turno.findById(turnoId);

    if (!turno) {
      return res.status(404).json({ ok: false, message: "Turno no encontrado" });
    }

    if (String(turno.especialistaId) !== especialistaId) {
      return res.status(403).json({ ok: false, message: "No podés cancelar turnos de otro profesional" });
    }

    const result = await cancelarTurno(turnoId);
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
}