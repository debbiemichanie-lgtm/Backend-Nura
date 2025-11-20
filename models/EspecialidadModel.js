import mongoose from "mongoose";

const EspecialidadSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

EspecialidadSchema.index({ nombre: "text" });

const Especialidad = mongoose.model("Especialidad", EspecialidadSchema);

export default Especialidad;
