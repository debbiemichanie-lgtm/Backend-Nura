import { Router } from "express";
import {
  crearBloqueoController,
  listarBloqueosController,
  eliminarBloqueoController,
  crearTurnoManualController,
} from "../controllers/AgendaController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/especialistas/:id/bloqueos", requireAuth, requireAdmin, listarBloqueosController);
router.post("/especialistas/:id/bloqueos", requireAuth, requireAdmin, crearBloqueoController);
router.delete("/especialistas/:id/bloqueos/:bloqueoId", requireAuth, requireAdmin, eliminarBloqueoController);
router.post("/especialistas/:id/turnos-manuales", requireAuth, requireAdmin, crearTurnoManualController);

export default router;