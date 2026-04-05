import { google } from "googleapis";
import Especialista from "../models/EspecialistaModel.js";

function createOAuthClient() {
  return new google.auth.OAuth2(
    (process.env.GOOGLE_CLIENT_ID || "").trim(),
    (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
    (process.env.GOOGLE_REDIRECT_URI || "").trim()
  );
}

export function getGoogleAuthUrl(especialistaId) {
  const oauth2Client = createOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar"],
    state: String(especialistaId).trim(),
  });
}

export async function saveGoogleTokens(code, especialistaId) {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  const especialista = await Especialista.findById(especialistaId);

  if (!especialista) {
    throw new Error("Especialista no encontrado");
  }

  return Especialista.findByIdAndUpdate(
    especialistaId,
    {
      "googleCalendar.connected": true,
      "googleCalendar.accessToken": tokens.access_token || null,
      "googleCalendar.refreshToken":
        tokens.refresh_token || especialista.googleCalendar?.refreshToken || null,
      "googleCalendar.tokenExpiryDate": tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : null,
    },
    { new: true }
  );
}

export async function getCalendarClient(especialistaId) {
  const especialista = await Especialista.findById(especialistaId);

  if (!especialista) {
    throw new Error("Especialista no encontrado");
  }

  const oauth2Client = createOAuthClient();

  oauth2Client.setCredentials({
    access_token: especialista.googleCalendar?.accessToken || undefined,
    refresh_token: especialista.googleCalendar?.refreshToken || undefined,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}