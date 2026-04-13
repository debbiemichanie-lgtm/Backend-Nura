import BloqueoAgenda from "../models/BloqueoAgendaModel.js";
import Turno from "../models/TurnoModel.js";
import Especialista from "../models/EspecialistaModel.js";

export async function crearBloqueoController(req, res, next) {
  try {
    const { id } = req.params;
    const { start, end, motivo, tipo } = req.body;

    const especialista = await Especialista.findById(id);
    if (!especialista) {
      return res.status(404).json({ ok: false, message: "Especialista no encontrado" });
    }

    const bloqueo = await BloqueoAgenda.create({
      especialistaId: id,
      start: new Date(start),
      end: new Date(end),
      motivo: motivo || "Bloqueo manual",
      tipo: tipo || "bloqueo",
    });

    res.status(201).json({ ok: true, data: bloqueo });
  } catch (error) {
    next(error);
  }
}

export async function listarBloqueosController(req, res, next) {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    const query = { especialistaId: id };

    if (from && to) {
      query.start = { $lt: new Date(to) };
      query.end = { $gt: new Date(from) };
    }

    const bloqueos = await BloqueoAgenda.find(query).sort({ start: 1 });

    res.json({ ok: true, data: bloqueos });
  } catch (error) {
    next(error);
  }
}

export async function eliminarBloqueoController(req, res, next) {
  try {
    const { bloqueoId } = req.params;

    const bloqueo = await BloqueoAgenda.findByIdAndDelete(bloqueoId);

    if (!bloqueo) {
      return res.status(404).json({ ok: false, message: "Bloqueo no encontrado" });
    }

    res.json({ ok: true, message: "Bloqueo eliminado" });
  } catch (error) {
    next(error);
  }
}

export async function crearTurnoManualController(req, res, next) {
  try {
    const { id } = req.params;
    const { pacienteNombre, pacienteEmail, start, end, notes } = req.body;

    const especialista = await Especialista.findById(id);
    if (!especialista) {
      return res.status(404).json({ ok: false, message: "Especialista no encontrado" });
    }

    const turno = await Turno.create({
      especialistaId: id,
      pacienteNombre: pacienteNombre || "Turno manual",
      pacienteEmail: pacienteEmail || "",
      start: new Date(start),
      end: new Date(end),
      notes: notes || "Cargado manualmente desde admin",
      source: "nura",
      status: "confirmed",
    });

    res.status(201).json({ ok: true, data: turno });
  } catch (error) {
    next(error);
  }
}