import Turno from "../models/TurnoModel.js";
import Especialista from "../models/EspecialistaModel.js";
import { getCalendarClient } from "./googleCalendarService.js";

export async function crearTurno(data) {
  const especialista = await Especialista.findById(data.especialistaId);

  if (!especialista) {
    throw new Error("Especialista no encontrado");
  }

  const turno = await Turno.create({
    especialistaId: data.especialistaId,
    pacienteNombre: data.pacienteNombre || "",
    pacienteEmail: data.pacienteEmail || "",
    start: new Date(data.start),
    end: new Date(data.end),
    notes: data.notes || "",
    source: "nura",
    status: "confirmed",
  });

  if (especialista.googleCalendar?.connected) {
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
  }

  return turno;
}

export async function listarTurnos() {
  return Turno.find()
    .populate("especialistaId", "name type modality")
    .sort({ start: 1 });
}

export async function listarTurnosPorEspecialista(especialistaId) {
  return Turno.find({ especialistaId }).sort({ start: 1 });
}