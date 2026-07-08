import { Router } from "express";
import { requireAuth, requireProfessionalOrAdmin } from "../middlewares/auth.js";
import {
  getMiPerfilProfesional,
  getMiAgendaProfesional,
  crearMiBloqueoProfesional,
  crearMiTurnoProfesional,
  cancelarMiTurnoProfesional,
} from "../controllers/ProfesionalController.js";

const router = Router();

router.get("/me", requireAuth, requireProfessionalOrAdmin, getMiPerfilProfesional);
router.get("/me/agenda", requireAuth, requireProfessionalOrAdmin, getMiAgendaProfesional);
router.post("/me/bloqueos", requireAuth, requireProfessionalOrAdmin, crearMiBloqueoProfesional);
router.post("/me/turnos", requireAuth, requireProfessionalOrAdmin, crearMiTurnoProfesional);
router.patch("/me/turnos/:turnoId/cancelar", requireAuth, requireProfessionalOrAdmin, cancelarMiTurnoProfesional);

export default router;