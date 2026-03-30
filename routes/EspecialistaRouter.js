import { Router } from "express";
import {
  getEspecialistas,
  getEspecialistaById,
  createEspecialista,
  updateEspecialista,
  deleteEspecialista,
} from "../controllers/EspecialistaController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", getEspecialistas);
router.get("/:id", getEspecialistaById);

router.post("/", requireAuth, requireAdmin, createEspecialista);
router.put("/:id", requireAuth, requireAdmin, updateEspecialista);
router.delete("/:id", requireAuth, requireAdmin, deleteEspecialista);

export default router;