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

  let userId = null;

  const accessEmail = cleanData.access?.email?.trim()?.toLowerCase();
  const accessPassword = cleanData.access?.password?.trim();

  if (accessEmail || accessPassword) {
    if (!accessEmail || !accessPassword) {
      throw new Error("Para crear acceso profesional tenés que enviar email y contraseña.");
    }

    const existingUser = await Usuario.findOne({ email: accessEmail });
    if (existingUser) {
      throw new Error("Ya existe un usuario con ese email de acceso.");
    }

    const profesionalUser = await Usuario.create({
      nombre: cleanData.name,
      email: accessEmail,
      password: accessPassword,
      rol: "professional",
    });

    userId = profesionalUser._id;

    cleanData.contact = {
      ...cleanData.contact,
      email: accessEmail,
    };
  }

  const doc = new Especialista({
    ...cleanData,
    userId,
  });

  return doc.save();
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