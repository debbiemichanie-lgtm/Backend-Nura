import { Router } from "express";
import { syncGoogleEventsController } from "../controllers/googleSyncController.js";

const router = Router();

router.post("/:especialistaId/sync", syncGoogleEventsController);

export default router;