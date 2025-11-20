// api/controllers/AuthController.js
import Usuario from "../models/UsuarioModel.js";
import bcrypt from "bcryptjs";
import { signToken } from "../middlewares/auth.js";

const {
  CLIENT_EMAILS,
  CLIENT_EMAIL,
  CLIENT_PASSWORD,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} = process.env;

// Emails que se consideran "client" fijos por .env
const clientEmails = (CLIENT_EMAILS || CLIENT_EMAIL || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/* =============== REGISTER =============== */
// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body || {};

    if (!nombre || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Nombre, email y contraseña son obligatorios",
      });
    }

    const normalized = email.toLowerCase();

    // No permitir usar mails reservados para admin/client
    if (
      (ADMIN_EMAIL &&
        normalized === ADMIN_EMAIL.toLowerCase()) ||
      clientEmails.includes(normalized)
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Ese email está reservado para una cuenta especial. Usá otro para registrarte.",
      });
    }

    const exists = await Usuario.findOne({ email: normalized });
    if (exists) {
      return res.status(400).json({
        ok: false,
        message: "Ya existe un usuario con ese email",
      });
    }

    // IMPORTANTE:
    // Si tu UsuarioModel ya tiene pre('save') que hashea con bcrypt,
    // acá guardamos la contraseña en plano y el modelo la encripta.
    // (Si NO tuvieras pre('save'), acá sí deberías hacer bcrypt.hash).
    const user = await Usuario.create({
      nombre,
      email: normalized,
      password,
      rol: "user", // 👈 todos los registrados normales son user
    });

    const payload = { id: user._id, email: user.email, rol: user.rol };
    const token = signToken(payload);

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado correctamente",
      token,
      user: payload,
    });
  } catch (err) {
    console.error("Error en register:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno al registrar usuario",
    });
  }
};

/* =============== LOGIN =============== */
// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalized = (email || "").toLowerCase();

    console.log("[AUTH] Login intento:", {
      email,
      normalized,
      hasPass: !!password,
    });

    if (!normalized || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email y contraseña son obligatorios",
      });
    }

    // 1) Admin por .env
    if (
      ADMIN_EMAIL &&
      ADMIN_PASSWORD &&
      normalized === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      console.log("[AUTH] Login admin OK (.env)");
      const payload = { email: ADMIN_EMAIL, rol: "admin" };
      const token = signToken(payload);
      return res.json({ ok: true, token, user: payload });
    }

    // 2) Cliente fijo por .env
    const isClientEmail = clientEmails.includes(normalized);
    const isClientPassOK = CLIENT_PASSWORD && password === CLIENT_PASSWORD;

    if (isClientEmail && isClientPassOK) {
      console.log("[AUTH] Login client OK (.env)");
      const payload = { email: normalized, rol: "client" };
      const token = signToken(payload);
      return res.json({ ok: true, token, user: payload });
    }

    // 3) Usuario registrado en MongoDB (rol user o lo que tenga en BD)
    const usuario = await Usuario.findOne({ email: normalized });
    console.log(
      "[AUTH] Usuario en BD:",
      usuario ? usuario.email : "no encontrado"
    );

    if (usuario) {
      let passwordOk = false;

      if (typeof usuario.compararPassword === "function") {
        // Si tu modelo tiene el método
        passwordOk = await usuario.compararPassword(password);
      } else {
        // Fallback por las dudas
        passwordOk = await bcrypt.compare(password, usuario.password);
      }

      console.log("[AUTH] Password OK BD:", passwordOk);

      if (!passwordOk) {
        return res
          .status(401)
          .json({ ok: false, message: "Credenciales inválidas" });
      }

      const rol = usuario.rol || "user";
      const payload = { id: usuario._id, email: usuario.email, rol };
      const token = signToken(payload);

      console.log("[AUTH] Login BD OK:", payload);
      return res.json({ ok: true, token, user: payload });
    }

    console.log("[AUTH] Login FAIL: no coincide con nada");
    return res
      .status(401)
      .json({ ok: false, message: "Credenciales inválidas" });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno en login",
    });
  }
};

/* =============== LOGIN DESDE .ENV (botón rápido admin) =============== */
// GET /api/auth/login-env
export const loginFromEnv = (_req, res) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({
      ok: false,
      message:
        "Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el .env del backend para usar este login.",
    });
  }

  const payload = { email: ADMIN_EMAIL, rol: "admin" };
  const token = signToken(payload);

  return res.json({ ok: true, token, user: payload });
};
