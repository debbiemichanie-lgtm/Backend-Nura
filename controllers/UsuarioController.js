// backend/controllers/UsuarioController.js
import jwt from "jsonwebtoken";
import Usuario from "../models/UsuarioModel.js";

const JWT_SECRET  = process.env.JWT_SECRET  || "cambia-esto";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

const clientList = String(process.env.CLIENT_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/* ----------------------- Helpers ----------------------- */

function sign(user) {
  return jwt.sign(
    { uid: user._id, email: user.email, rol: user.rol },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

/* ----------------------- Auth -------------------------- */

export async function register(req, res) {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "Faltan campos" });
    }

    const emailNorm = email.toLowerCase();
    const existe = await Usuario.findOne({ email: emailNorm });
    if (existe) {
      return res
        .status(409)
        .json({ ok: false, message: "Ese email ya está registrado" });
    }

    // rol por defecto
    let rol = "user";
    if (clientList.includes(emailNorm)) rol = "client";

    const user = await Usuario.create({ nombre, email: emailNorm, password, rol });
    const token = sign(user);

    res.status(201).json({
      ok: true,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      token,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      message: "Error en registro",
      detail: String(e),
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const emailNorm = email.toLowerCase();

    const user = await Usuario.findOne({ email: emailNorm });
    if (!user) {
      return res
        .status(401)
        .json({ ok: false, message: "Credenciales inválidas" });
    }

    const ok = await user.compararPassword(password);
    if (!ok) {
      return res
        .status(401)
        .json({ ok: false, message: "Credenciales inválidas" });
    }

    // upgrade automático a 'client' si está en CLIENT_EMAILS
    if (user.rol === "user" && clientList.includes(emailNorm)) {
      user.rol = "client";
      await user.save();
    }

    const token = sign(user);

    res.json({
      ok: true,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      token,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      message: "Error en login",
      detail: String(e),
    });
  }
}

export async function me(req, res) {
  res.json({ ok: true, user: req.user });
}

/* ------------------- ABM DE CLIENTES ------------------- */

/**
 * GET /api/usuarios
 * Lista solo usuarios con rol "client" (sección Clientes del frontend)
 */
export async function getUsers(_req, res) {
  try {
    const list = await Usuario.find({ rol: "client" }).select("-password");
    res.json({ ok: true, data: list });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Error obteniendo usuarios",
      detail: String(err),
    });
  }
}

/**
 * POST /api/usuarios
 * Crea un nuevo usuario con rol "client" (solo admin)
 */
export async function createClientUser(req, res) {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "Faltan campos" });
    }

    const emailNorm = email.toLowerCase();
    const exists = await Usuario.findOne({ email: emailNorm });
    if (exists) {
      return res
        .status(409)
        .json({ ok: false, message: "Ese email ya existe" });
    }

    const user = await Usuario.create({
      nombre,
      email: emailNorm,
      password,
      rol: "client", // siempre client para esta sección
    });

    res.status(201).json({
      ok: true,
      message: "Usuario creado",
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Error creando usuario",
      detail: String(err),
    });
  }
}

/**
 * PUT /api/usuarios/:id
 * Editar usuario cliente (nombre, email y opcionalmente password)
 */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { nombre, email, password } = req.body;

    const user = await Usuario.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    if (nombre) user.nombre = nombre;
    if (email) user.email = email.toLowerCase();
    if (password && password.trim()) user.password = password; // se hashea en el modelo

    await user.save();

    res.json({
      ok: true,
      message: "Usuario actualizado",
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Error actualizando usuario",
      detail: String(err),
    });
  }
}

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario cliente (solo admin)
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Usuario.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    res.json({ ok: true, message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Error eliminando usuario",
      detail: String(err),
    });
  }
}
