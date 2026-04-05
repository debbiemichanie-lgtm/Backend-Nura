import {
  getGoogleAuthUrl,
  saveGoogleTokens,
} from "../services/googleCalendarService.js";

export async function connectGoogle(req, res) {
  const { id } = req.params;
  const url = getGoogleAuthUrl(id);
  res.json({ url });
}

export async function googleCallback(req, res) {
  const { code, state } = req.query;

  await saveGoogleTokens(code, state);

  res.send("Google conectado correctamente");
}