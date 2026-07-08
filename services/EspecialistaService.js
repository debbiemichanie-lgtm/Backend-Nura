import Especialista from "../models/EspecialistaModel.js";
import Usuario from "../models/UsuarioModel.js";
// ================= HELPERS =================

function ensureHorarios(data) {
  if (!data.horarios || typeof data.horarios !== "object") {
    return data;
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

  if (!cleanData.sessionDuration) {
    cleanData.sessionDuration = 60;
  }

  cleanData = ensureHorarios(cleanData);

  const doc = new Especialista(cleanData);
  const saved = await doc.save();

  const emailProfesional = saved.contact?.email?.trim().toLowerCase();

  if (emailProfesional) {
    const exists = await Usuario.findOne({ email: emailProfesional });

    if (!exists) {
      await Usuario.create({
        nombre: saved.name,
        email: emailProfesional,
        password: "123456",
        rol: "professional",
        especialistaId: saved._id,
      });
    }
  }

  return saved;
}

export async function actualizarEspecialista(id, data) {
  let cleanData = { ...data };

  if (!cleanData.sessionDuration) {
    cleanData.sessionDuration = 60;
  }

  cleanData = ensureHorarios(cleanData);

  return Especialista.findByIdAndUpdate(id, cleanData, {
    new: true,
    runValidators: true,
  });
}

export async function eliminarEspecialista(id) {
  return Especialista.findByIdAndDelete(id);
}