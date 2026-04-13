import mongoose from "mongoose";

const BloqueoAgendaSchema = new mongoose.Schema(
  {
    especialistaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Especialista",
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    motivo: {
      type: String,
      default: "Bloqueo manual",
      trim: true,
    },
    tipo: {
      type: String,
      enum: ["bloqueo", "turno_manual"],
      default: "bloqueo",
    },
  },
  { timestamps: true }
);

export default mongoose.model("BloqueoAgenda", BloqueoAgendaSchema);