// api/routes/AuthRouter.js
import { Router } from "express";
import { login, loginFromEnv, register } from "../controllers/AuthController.js";

const router = Router();

// Registro normal
router.post("/register", register);

// Login normal (admin .env, clientes .env o usuarios de Mongo)
router.post("/login", login);

// Login rápido admin (.env)
router.get("/login-env", loginFromEnv);

export default router;
