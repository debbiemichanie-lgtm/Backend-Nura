import { Router } from "express";
import {
  crearTurnoController,
  listarTurnosController,
  listarTurnosPorEspecialistaController,
  cancelarTurnoController,
  editarTurnoController,
} from "../controllers/TurnoController.js";

const router = Router();

router.get("/", listarTurnosController);
router.get("/especialista/:especialistaId", listarTurnosPorEspecialistaController);
router.post("/", crearTurnoController);
router.patch("/:turnoId", editarTurnoController);
router.patch("/:turnoId/cancelar", cancelarTurnoController);

export default router;