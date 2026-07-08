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

const clientEmails = (CLIENT_EMAILS || CLIENT_EMAIL || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

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

    if (
      (ADMIN_EMAIL && normalized === ADMIN_EMAIL.toLowerCase()) ||
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

    const user = await Usuario.create({
      nombre,
      email: normalized,
      password,
      rol: "user",
    });

    const payload = {
      uid: user._id,
      email: user.email,
      rol: user.rol,
      especialistaId: user.especialistaId || null,
    };

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalized = (email || "").toLowerCase();

    if (!normalized || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email y contraseña son obligatorios",
      });
    }

    if (
      ADMIN_EMAIL &&
      ADMIN_PASSWORD &&
      normalized === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      const payload = {
        email: ADMIN_EMAIL,
        rol: "admin",
        especialistaId: null,
      };

      const token = signToken(payload);

      return res.json({ ok: true, token, user: payload });
    }

    const isClientEmail = clientEmails.includes(normalized);
    const isClientPassOK = CLIENT_PASSWORD && password === CLIENT_PASSWORD;

    if (isClientEmail && isClientPassOK) {
      const payload = {
        email: normalized,
        rol: "client",
        especialistaId: null,
      };

      const token = signToken(payload);

      return res.json({ ok: true, token, user: payload });
    }

    const usuario = await Usuario.findOne({ email: normalized });

    if (!usuario) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales inválidas",
      });
    }

    let passwordOk = false;

    if (typeof usuario.compararPassword === "function") {
      passwordOk = await usuario.compararPassword(password);
    } else {
      passwordOk = await bcrypt.compare(password, usuario.password);
    }

    if (!passwordOk) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales inválidas",
      });
    }

    const rol = usuario.rol || "user";

    const payload = {
      uid: usuario._id,
      email: usuario.email,
      rol,
      especialistaId: usuario.especialistaId || null,
    };

    const token = signToken(payload);

    return res.json({
      ok: true,
      token,
      user: payload,
    });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({
      ok: false,
      message: "Error interno en login",
    });
  }
};

export const loginFromEnv = (_req, res) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({
      ok: false,
      message:
        "Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el .env del backend para usar este login.",
    });
  }

  const payload = {
    email: ADMIN_EMAIL,
    rol: "admin",
    especialistaId: null,
  };

  const token = signToken(payload);

  return res.json({ ok: true, token, user: payload });
};