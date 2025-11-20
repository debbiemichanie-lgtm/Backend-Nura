import Especialidad from '../models/EspecialidadModel.js';

export async function listarEspecialidades() {
  return Especialidad.find().lean();
}

export async function obtenerEspecialidadPorId(id) {
  return Especialidad.findById(id).lean();
}

export async function crearEspecialidad(data) {
  const doc = new Especialidad(data);
  return await doc.save();
}

export async function actualizarEspecialidad(id, data) {
  return Especialidad.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

export async function eliminarEspecialidad(id) {
  return Especialidad.findByIdAndDelete(id).lean();
}
