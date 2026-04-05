import {
  getGoogleAuthUrl,
  saveGoogleTokens,
} from "../services/googleCalendarService.js";

export async function connectGoogle(req, res, next) {
  try {
    const { id } = req.params;
    const url = getGoogleAuthUrl(id);
    return res.redirect(url);
  } catch (error) {
    next(error);
  }
}

export async function googleCallback(req, res, next) {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: "Faltan code o state" });
    }

    await saveGoogleTokens(code, state);

    return res.send("Google conectado correctamente");
  } catch (error) {
    next(error);
  }
}