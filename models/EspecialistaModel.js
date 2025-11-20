// api/models/EspecialistaModel.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const EspecialistaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Antes: enum fijo (Psicóloga, Psiquiatra, etc.)
    // Ahora: string libre, pero validamos por nombre de Especialidad existente desde el frontend / ABM.
    type: {
      type: String,
      required: true,
      trim: true,
    },

    modality: {
      type: String,
      enum: ["presencial", "virtual", "mixta"],
      required: true,
    },

    coverage: {
      type: String,
      enum: ["prepaga", "obra social", "privado"],
      required: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    province: {
      type: String,
      trim: true,
    },

    insurance: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      trim: true,
    },

    contact: {
      email: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      phone: { type: String, trim: true },
      website: { type: String, trim: true },
    },

    avatar: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Especialista", EspecialistaSchema);
