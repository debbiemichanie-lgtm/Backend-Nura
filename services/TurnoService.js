import Turno from "../models/TurnoModel.js";
import Especialista from "../models/EspecialistaModel.js";
import { getCalendarClient } from "./googleCalendarService.js";

// ================= CREAR TURNO =================

export async function crearTurno(data) {
  const especialista = await Especialista.findById(data.especialistaId);

  if (!especialista) {
    throw new Error("Especialista no encontrado");
  }

  const start = new Date(data.start);
  const end = new Date(data.end);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Fecha inválida");
  }

  if (end <= start) {
    throw new Error("La fecha de fin debe ser mayor a la de inicio");
  }

  const overlappingTurno = await Turno.findOne({
    especialistaId: data.especialistaId,
    status: "confirmed",
    start: { $lt: end },
    end: { $gt: start },
  });

  if (overlappingTurno) {
    throw new Error("Ese horario ya está ocupado");
  }

  const turno = await Turno.create({
    especialistaId: data.especialistaId,
    pacienteNombre: data.pacienteNombre || "",
    pacienteEmail: data.pacienteEmail || "",
    start,
    end,
    notes: data.notes || "",
    source: "nura",
    status: "confirmed",
  });

  if (especialista.googleCalendar?.connected) {
    try {
      const calendar = await getCalendarClient(especialista._id);

      const event = await calendar.events.insert({
        calendarId: especialista.googleCalendar.calendarId || "primary",
        requestBody: {
          summary: `Turno con ${turno.pacienteNombre || "paciente"}`,
          description: turno.notes || "Turno creado desde Nura",
          start: {
            dateTime: turno.start.toISOString(),
            timeZone: "America/Argentina/Buenos_Aires",
          },
          end: {
            dateTime: turno.end.toISOString(),
            timeZone: "America/Argentina/Buenos_Aires",
          },
          extendedProperties: {
            private: {
              nuraTurnoId: String(turno._id),
              source: "nura",
            },
          },
        },
      });

      turno.googleEventId = event.data.id;
      turno.googleCalendarId =
        especialista.googleCalendar.calendarId || "primary";

      await turno.save();
    } catch (error) {
      console.error("Error al crear evento en Google Calendar:", error.message);
    }
  }

  return turno;
}

// ================= LISTAR =================

export async function listarTurnos() {
  return Turno.find()
    .populate("especialistaId", "name type modality")
    .sort({ start: 1 });
}

export async function listarTurnosPorEspecialista(especialistaId) {
  return Turno.find({ especialistaId }).sort({ start: 1 });
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

  const especialista = await Especialista.findById(turno.especialistaId);

  turno.status = "cancelled";
  await turno.save();

  if (
    especialista?.googleCalendar?.connected &&
    turno.googleEventId &&
    turno.source === "nura"
  ) {
    try {
      const calendar = await getCalendarClient(especialista._id);

      await calendar.events.delete({
        calendarId: turno.googleCalendarId || "primary",
        eventId: turno.googleEventId,
      });
    } catch (error) {
      console.error("Error al borrar evento en Google Calendar:", error.message);
    }
  }

  return turno;
}

// ================= EDITAR =================

export async function editarTurno(turnoId, data) {
  const turno = await Turno.findById(turnoId);

  if (!turno) {
    throw new Error("Turno no encontrado");
  }

  const especialista = await Especialista.findById(turno.especialistaId);

  const start = data.start ? new Date(data.start) : turno.start;
  const end = data.end ? new Date(data.end) : turno.end;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Fecha inválida");
  }

  if (end <= start) {
    throw new Error("La fecha de fin debe ser mayor a la de inicio");
  }

  const overlappingTurno = await Turno.findOne({
    _id: { $ne: turnoId },
    especialistaId: turno.especialistaId,
    status: "confirmed",
    start: { $lt: end },
    end: { $gt: start },
  });

  if (overlappingTurno) {
    throw new Error("Ese horario ya está ocupado");
  }

  turno.pacienteNombre = data.pacienteNombre ?? turno.pacienteNombre;
  turno.pacienteEmail = data.pacienteEmail ?? turno.pacienteEmail;
  turno.start = start;
  turno.end = end;
  turno.notes = data.notes ?? turno.notes;

  await turno.save();

  if (
    especialista?.googleCalendar?.connected &&
    turno.googleEventId &&
    turno.source === "nura"
  ) {
    try {
      const calendar = await getCalendarClient(especialista._id);

      await calendar.events.update({
        calendarId: turno.googleCalendarId || "primary",
        eventId: turno.googleEventId,
        requestBody: {
          summary: `Turno con ${turno.pacienteNombre || "paciente"}`,
          description: turno.notes || "Turno actualizado desde Nura",
          start: {
            dateTime: turno.start.toISOString(),
            timeZone: "America/Argentina/Buenos_Aires",
          },
          end: {
            dateTime: turno.end.toISOString(),
            timeZone: "America/Argentina/Buenos_Aires",
          },
          extendedProperties: {
            private: {
              nuraTurnoId: String(turno._id),
              source: "nura",
            },
          },
        },
      });
    } catch (error) {
      console.error("Error al actualizar evento en Google Calendar:", error.message);
    }
  }

  return turno;
}