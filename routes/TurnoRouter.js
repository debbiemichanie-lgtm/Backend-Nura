import { Router } from "express";
import {
  crearTurnoController,
  listarTurnosController,
  listarTurnosPorEspecialistaController,
} from "../controllers/TurnoController.js";

const router = Router();

router.get("/", listarTurnosController);
router.get("/especialista/:especialistaId", listarTurnosPorEspecialistaController);
router.post("/", crearTurnoController);

export default router;