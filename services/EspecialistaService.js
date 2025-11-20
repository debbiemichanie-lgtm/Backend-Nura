import Especialista from '../models/EspecialistaModel.js';

export async function listarEspecialistas(filtros = {}) {
  return Especialista.find(filtros).lean();
}

export async function obtenerEspecialistaPorId(id) {
  return Especialista.findById(id).lean();
}

export async function crearEspecialista(data) {
  const doc = new Especialista(data);
  return await doc.save();
}

export async function actualizarEspecialista(id, data) {
  return Especialista.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
}

export async function eliminarEspecialista(id) {
  return Especialista.findByIdAndDelete(id).lean();
}
