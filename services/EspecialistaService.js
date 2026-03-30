import Especialista from "../models/EspecialistaModel.js";

// ================= HELPERS =================

function ensureHorarios(data) {
  if (!data.horarios || typeof data.horarios !== "object") {
    return data; // deja que el modelo aplique defaults
  }

  const base = {
    lunes: { active: true, from: "09:00", to: "17:00" },
    martes: { active: true, from: "09:00", to: "17:00" },
    miercoles: { active: true, from: "09:00", to: "17:00" },
    jueves: { active: true, from: "09:00", to: "17:00" },
    viernes: { active: true, from: "09:00", to: "17:00" },
    sabado: { active: false, from: "", to: "" },
    domingo: { active: false, from: "", to: "" },
  };

  const result = { ...base };

  for (const key in base) {
    if (data.horarios[key]) {
      result[key] = {
        active:
          typeof data.horarios[key].active === "boolean"
            ? data.horarios[key].active
            : base[key].active,
        from: data.horarios[key].from || base[key].from,
        to: data.horarios[key].to || base[key].to,
      };
    }
  }

  return {
    ...data,
    horarios: result,
  };
}

// ================= SERVICES =================

export async function listarEspecialistas() {
  return Especialista.find().sort({ name: 1 });
}

export async function obtenerEspecialistaPorId(id) {
  return Especialista.findById(id);
}

export async function crearEspecialista(data) {
  let cleanData = { ...data };

  // asegurar duración
  if (!cleanData.sessionDuration) {
    cleanData.sessionDuration = 60;
  }

  // asegurar horarios
  cleanData = ensureHorarios(cleanData);

  const doc = new Especialista(cleanData);
  return doc.save();
}

export async function actualizarEspecialista(id, data) {
  let cleanData = { ...data };

  // asegurar duración
  if (!cleanData.sessionDuration) {
    cleanData.sessionDuration = 60;
  }

  // asegurar horarios
  cleanData = ensureHorarios(cleanData);

  return Especialista.findByIdAndUpdate(id, cleanData, {
    new: true,
    runValidators: true,
  });
}

export async function eliminarEspecialista(id) {
  return Especialista.findByIdAndDelete(id);
}