import { syncGoogleEvents } from "../services/googleSyncService.js";

export async function syncGoogleEventsController(req, res, next) {
  try {
    const { especialistaId } = req.params;
    const result = await syncGoogleEvents(especialistaId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}