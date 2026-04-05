import Especialista from "../models/EspecialistaModel.js";
import Turno from "../models/TurnoModel.js";
import { getCalendarClient } from "./googleCalendarService.js";

export async function syncGoogleEvents(especialistaId) {
  const especialista = await Especialista.findById(especialistaId);

  if (!especialista) {
    throw new Error("Especialista no encontrado");
  }

  if (!especialista.googleCalendar?.connected) {
    throw new Error("El especialista no tiene Google Calendar conectado");
  }

  const calendar = await getCalendarClient(especialistaId);

  const response = await calendar.events.list({
    calendarId: especialista.googleCalendar.calendarId || "primary",
    singleEvents: true,
    orderBy: "startTime",
    timeMin: new Date().toISOString(),
    maxResults: 100,
  });

  const items = response.data.items || [];
  let imported = 0;
  let updated = 0;

  for (const event of items) {
    const nuraTurnoId =
      event.extendedProperties?.private?.nuraTurnoId || null;

    // Si el evento fue creado por Nura, no lo duplicamos
    if (nuraTurnoId) {
      continue;
    }

    const start = event.start?.dateTime || event.start?.date;
    const end = event.end?.dateTime || event.end?.date;

    if (!start || !end) {
      continue;
    }

    const existing = await Turno.findOne({
      especialistaId,
      googleEventId: event.id,
    });

    const payload = {
      especialistaId,
      pacienteNombre: event.summary || "Evento de Google Calendar",
      pacienteEmail: "",
      start: new Date(start),
      end: new Date(end),
      notes: event.description || "",
      status: event.status === "cancelled" ? "cancelled" : "confirmed",
      source: "google",
      googleEventId: event.id,
      googleCalendarId: especialista.googleCalendar.calendarId || "primary",
    };

    if (existing) {
      await Turno.findByIdAndUpdate(existing._id, payload, { new: true });
      updated++;
    } else {
      await Turno.create(payload);
      imported++;
    }
  }

  return {
    ok: true,
    totalGoogleEvents: items.length,
    imported,
    updated,
  };
}