import mongoose from "mongoose";

const TurnoSchema = new mongoose.Schema(
  {
    especialistaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Especialista",
      required: true,
    },
    pacienteNombre: {
      type: String,
      default: "",
      trim: true,
    },
    pacienteEmail: {
      type: String,
      default: "",
      trim: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    source: {
      type: String,
      enum: ["nura", "google"],
      default: "nura",
    },
    googleEventId: {
      type: String,
      default: null,
    },
    googleCalendarId: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Turno", TurnoSchema);