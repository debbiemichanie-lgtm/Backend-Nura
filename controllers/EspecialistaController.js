import {
  listarEspecialistas,
  obtenerEspecialistaPorId,
  crearEspecialista as svcCrear,
  actualizarEspecialista as svcActualizar,
  eliminarEspecialista as svcEliminar,
} from "../services/EspecialistaService.js";

export async function getEspecialistas(req, res, next) {
  try {
    const { type, modality, city, q, coverage, page = 1, limit = 60 } = req.query;

    const filter = {};

    if (type && type !== "todas") filter.type = type;
    if (modality && modality !== "todas") filter.modality = modality;
    if (coverage && coverage !== "todas") filter.coverage = coverage;
    if (city && city !== "todas") filter.city = new RegExp(`^${city}$`, "i");
    if (q && q.trim()) filter.$text = { $search: q.trim() };

    const skip = (Number(page) - 1) * Number(limit);

    const Especialista = (await import("../models/EspecialistaModel.js")).default;

    const [items, total] = await Promise.all([
      Especialista.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Especialista.countDocuments(filter),
    ]);

    res.json({
      ok: true,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getEspecialistaById(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await obtenerEspecialistaPorId(id);

    if (!doc) {
      return res.status(404).json({ ok: false, message: "No encontrado" });
    }

    res.json({ ok: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function createEspecialista(req, res, next) {
  try {
    const doc = await svcCrear(req.body);
    res.status(201).json({ ok: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function updateEspecialista(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await svcActualizar(id, req.body);

    if (!doc) {
      return res.status(404).json({ ok: false, message: "No encontrado" });
    }

    res.json({ ok: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function deleteEspecialista(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await svcEliminar(id);

    if (!doc) {
      return res.status(404).json({ ok: false, message: "No encontrado" });
    }

    res.json({ ok: true, message: "Eliminado" });
  } catch (err) {
    next(err);
  }
}