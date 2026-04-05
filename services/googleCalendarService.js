import { google } from "googleapis";
import Especialista from "../models/EspecialistaModel.js";

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// URL para conectar Google
export function getGoogleAuthUrl(especialistaId) {
  const oauth2Client = createOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar"],
    state: especialistaId,
  });
}

// Guardar tokens
export async function saveGoogleTokens(code, especialistaId) {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  const especialista = await Especialista.findById(especialistaId);

  return Especialista.findByIdAndUpdate(
    especialistaId,
    {
      "googleCalendar.connected": true,
      "googleCalendar.accessToken": tokens.access_token,
      "googleCalendar.refreshToken":
        tokens.refresh_token ||
        especialista.googleCalendar?.refreshToken,
      "googleCalendar.tokenExpiryDate": tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : null,
    },
    { new: true }
  );
}

// Cliente listo para usar
export async function getCalendarClient(especialistaId) {
  const especialista = await Especialista.findById(especialistaId);

  const oauth2Client = createOAuthClient();

  oauth2Client.setCredentials({
    access_token: especialista.googleCalendar.accessToken,
    refresh_token: especialista.googleCalendar.refreshToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}