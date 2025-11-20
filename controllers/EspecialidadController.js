// api/controllers/EspecialidadController.js
import Especialidad from "../models/EspecialidadModel.js";

// Nombres de las especialidades base del sistema
// (las que no se pueden editar ni borrar)
const BASE_ESPECIALIDADES = [
  "Psicóloga",
  "Psiquiatra",
  "Ginecóloga",
  "Nutricionista",
   "Clínico",
];

// GET /api/especialidades
export const list = async (req, res, next) => {
  try {
    const { q = "" } = req.query;
    const filter = q ? { nombre: { $regex: q, $options: "i" } } : {};

    // Busco todas las especialidades existentes
    let data = await Especialidad.find(filter).sort({ nombre: 1 });

    // Verifico si faltan las base y las creo automáticamente
    for (const base of BASE_ESPECIALIDADES) {
      if (!data.some((esp) => esp.nombre === base)) {
        const created = await Especialidad.create({
          nombre: base,
          descripcion: "Especialidad base del sistema (no editable)",
        });
        data.push(created);
      }
    }

    // Reordeno alfabéticamente
    data = data.sort((a, b) => a.nombre.localeCompare(b.nombre));

    return res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/especialidades/:id
export const getById = async (req, res, next) => {
  try {
    const esp = await Especialidad.findById(req.params.id);
    if (!esp)
      return res
        .status(404)
        .json({ ok: false, message: "Especialidad no encontrada" });
    res.json({ ok: true, data: esp });
  } catch (err) {
    next(err);
  }
};

// POST /api/especialidades
export const create = async (req, res, next) => {
  try {
    const { nombre, descripcion = "" } = req.body || {};
    if (!nombre || !nombre.trim()) {
      return res
        .status(400)
        .json({ ok: false, message: "El nombre es obligatorio" });
    }

    const nombreLimpio = nombre.trim();

    const exists = await Especialidad.findOne({ nombre: nombreLimpio });
    if (exists) {
      return res
        .status(400)
        .json({ ok: false, message: "Ya existe una especialidad con ese nombre" });
    }

    const esp = await Especialidad.create({
      nombre: nombreLimpio,
      descripcion: descripcion.trim(),
    });

    res.status(201).json({ ok: true, data: esp });
  } catch (err) {
    next(err);
  }
};

// PUT /api/especialidades/:id
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body || {};

    const esp = await Especialidad.findById(id);
    if (!esp)
      return res
        .status(404)
        .json({ ok: false, message: "Especialidad no encontrada" });

    if (BASE_ESPECIALIDADES.includes(esp.nombre)) {
      return res.status(400).json({
        ok: false,
        message: "No se puede editar una especialidad base del sistema.",
      });
    }

    if (nombre && nombre.trim()) esp.nombre = nombre.trim();
    if (typeof descripcion === "string") esp.descripcion = descripcion.trim();

    await esp.save();
    res.json({ ok: true, data: esp });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/especialidades/:id
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const esp = await Especialidad.findById(id);
    if (!esp)
      return res
        .status(404)
        .json({ ok: false, message: "Especialidad no encontrada" });

    if (BASE_ESPECIALIDADES.includes(esp.nombre)) {
      return res.status(400).json({
        ok: false,
        message: "No se puede borrar una especialidad base del sistema.",
      });
    }

    await esp.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
