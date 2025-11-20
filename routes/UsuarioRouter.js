// backend/routes/UsuarioRouter.js
import { Router } from "express";
import {
  register,
  login,
  me,
  getUsers,
  createClientUser,
  updateUser,
  deleteUser,
} from "../controllers/UsuarioController.js";

import {
  requireAuth,
  requireAdmin,
  adminLogin,
} from "../middlewares/auth.js";

const r = Router();

/* ------------------ AUTENTICACIÓN ------------------ */

r.post("/register", register);
r.post("/login", login);
r.post("/admin/login", adminLogin);
r.get("/me", requireAuth, me);

/* ------------------ CLIENTES (ADMIN) ------------------ */

// Listar todos los clientes
r.get("/", requireAuth, requireAdmin, getUsers);

// Crear un cliente
r.post("/", requireAuth, requireAdmin, createClientUser);

// Editar un cliente
r.put("/:id", requireAuth, requireAdmin, updateUser);

// Borrar un cliente
r.delete("/:id", requireAuth, requireAdmin, deleteUser);

export default r;
