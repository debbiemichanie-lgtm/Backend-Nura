// api/routes/EspecialidadRouter.js
import { Router } from "express";
import {
  list,
  getById,
  create,
  update,
  remove,
} from "../controllers/EspecialidadController.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

// Rutas públicas
router.get("/", list);
router.get("/:id", getById);

// Rutas protegidas (solo admin)
router.post("/", requireAuth, requireAdmin, create);
router.put("/:id", requireAuth, requireAdmin, update);
router.delete("/:id", requireAuth, requireAdmin, remove);

export default router;
