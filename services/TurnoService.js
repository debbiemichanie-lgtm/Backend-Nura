import Turno from "../models/TurnoModel.js";
import Especialista from "../models/EspecialistaModel.js";
import BloqueoAgenda from "../models/BloqueoAgendaModel.js";

// ================= HELPERS =================

function parseTurnoDates(data, fallbackStart = null, fallbackEnd = null) {
  const start = data.start ? new Date(data.start) : fallbackStart;
  const end = data.end ? new Date(data.end) : fallbackEnd;

  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Fecha inválida");
  }

  if (end <= start) {
    throw new Error("La fecha de fin debe ser mayor a la de inicio");
  }

  return { start, end };
}

function getDayRange(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
}

async function validarSolapamientoTurnos(especialistaId, start, end, excludeTurnoId = null) {
  const query = {
    especialistaId,
    status: "confirmed",
    start: { $lt: end },
    end: { $gt: start },
  };

  if (excludeTurnoId) {
    query._id = { $ne: excludeTurnoId };
  }

  const overlappingTurno = await Turno.findOne(query);

  if (overlappingTurno) {
    throw new Error("Ese horario ya está ocupado");
  }
}

async function validarSolapamientoBloqueos(especialistaId, start, end) {
  const overlappingBloqueo = await BloqueoAgenda.findOne({
    especialistaId,
    start: { $lt: end },
    end: { $gt: start },
  });

  if (overlappingBloqueo) {
    throw new Error("Ese horario está bloqueado");
  }
}

async function validarUnTurnoPorDia(especialistaId, pacienteEmail, start, excludeTurnoId = null) {
  const email = String(pacienteEmail || "").trim().toLowerCase();
  if (!email) return;

  const { startOfDay, endOfDay } = getDayRange(start);

  const query = {
    especialistaId,
    pacienteEmail: email,
    status: "confirmed",
    start: { $gte: startOfDay, $lte: endOfDay },
  };

  if (excludeTurnoId) {
    query._id = { $ne: excludeTurnoId };
  }

  const existingSameDay = await Turno.findOne(query);

  if (existingSameDay) {
    throw new Error("Ya tenés un turno con este profesional para ese día");
  }
}

async function validarDisponibilidadCompleta(
  especialistaId,
  start,
  end,
  pacienteEmail = "",
  excludeTurnoId = null
) {
  await validarSolapamientoTurnos(especialistaId, start, end, excludeTurnoId);
  await validarSolapamientoBloqueos(especialistaId, start, end);
  await validarUnTurnoPorDia(especialistaId, pacienteEmail, start, excludeTurnoId);
}

// ================= CREAR TURNO =================

export async function crearTurno(data) {
  const especialista = await Especialista.findById(data.especialistaId);

  if (!especialista) {
    throw new Error("Especialista no encontrado");
  }

  const { start, end } = parseTurnoDates(data);

  await validarDisponibilidadCompleta(
    especialista._id,
    start,
    end,
    data.pacienteEmail || "",
    null
  );

  return Turno.create({
    especialistaId: data.especialistaId,
    pacienteNombre: data.pacienteNombre || "",
    pacienteEmail: String(data.pacienteEmail || "").trim().toLowerCase(),
    start,
    end,
    notes: data.notes || "",
    source: "nura",
    status: "confirmed",
  });
}

// ================= LISTAR =================

export async function listarTurnos() {
  return Turno.find()
    .populate("especialistaId", "name type modality")
    .sort({ start: 1 });
}

export async function listarTurnosPorEspecialista(especialistaId) {
  return Turno.find({
    especialistaId,
    status: "confirmed",
  }).sort({ start: 1 });
}

// ================= DISPONIBILIDAD =================

export async function obtenerDisponibilidad(especialistaId, from, to) {
  const especialista = await Especialista.findById(especialistaId);

  if (!especialista) {
    throw new Error("Especialista no encontrado");
  }

  const startRange = new Date(from);
  const endRange = new Date(to);

  if (isNaN(startRange.getTime()) || isNaN(endRange.getTime())) {
    throw new Error("Rango inválido");
  }

  if (endRange <= startRange) {
    throw new Error("El rango es inválido");
  }

  const turnos = await Turno.find({
    especialistaId,
    status: "confirmed",
    start: { $lt: endRange },
    end: { $gt: startRange },
  }).sort({ start: 1 });

  const bloqueos = await BloqueoAgenda.find({
    especialistaId,
    start: { $lt: endRange },
    end: { $gt: startRange },
  }).sort({ start: 1 });

  const ocupados = [
    ...turnos.map((t) => ({
      source: "turno",
      turnoId: String(t._id),
      start: t.start,
      end: t.end,
      notes: t.notes || "",
    })),
    ...bloqueos.map((b) => ({
      source: b.tipo || "bloqueo",
      bloqueoId: String(b._id),
      start: b.start,
      end: b.end,
      motivo: b.motivo || "",
    })),
  ];

  return {
    especialistaId: String(especialista._id),
    ocupados,
  };
}

// ================= CANCELAR =================

export async function cancelarTurno(turnoId) {
  const turno = await Turno.findById(turnoId);

  if (!turno) {
    throw new Error("Turno no encontrado");
  }

  if (turno.status === "cancelled") {
    return turno;
  }

  turno.status = "cancelled";
  await turno.save();

  return turno;
}

// ================= EDITAR =================

export async function editarTurno(turnoId, data) {
  const turno = await Turno.findById(turnoId);

  if (!turno) {
    throw new Error("Turno no encontrado");
  }

  const { start, end } = parseTurnoDates(data, turno.start, turno.end);

  await validarDisponibilidadCompleta(
    turno.especialistaId,
    start,
    end,
    data.pacienteEmail ?? turno.pacienteEmail ?? "",
    turnoId
  );

  turno.pacienteNombre = data.pacienteNombre ?? turno.pacienteNombre;
  turno.pacienteEmail = String(
    data.pacienteEmail ?? turno.pacienteEmail ?? ""
  ).trim().toLowerCase();
  turno.start = start;
  turno.end = end;
  turno.notes = data.notes ?? turno.notes;

  await turno.save();

  return turno;
}