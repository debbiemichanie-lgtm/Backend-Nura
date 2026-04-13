import mongoose from "mongoose";

const { Schema } = mongoose;

const DayScheduleSchema = new Schema(
  {
    active: {
      type: Boolean,
      default: false,
    },
    from: {
      type: String,
      trim: true,
      default: "",
    },
    to: {
      type: String,
      trim: true,
      default: "",
    },
   
  },
  { _id: false }
);

const EspecialistaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

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

    sessionDuration: {
      type: Number,
      enum: [30, 45, 50, 60, 90],
      default: 60,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    province: {
      type: String,
      trim: true,
      default: "",
    },

    insurance: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    contact: {
      email: { type: String, trim: true, default: "" },
      whatsapp: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      website: { type: String, trim: true, default: "" },
    },

    avatar: {
      type: String,
      trim: true,
      default: "",
    },

    horarios: {
      lunes: {
        type: DayScheduleSchema,
        default: () => ({ active: true, from: "09:00", to: "17:00" }),
      },
      martes: {
        type: DayScheduleSchema,
        default: () => ({ active: true, from: "09:00", to: "17:00" }),
      },
      miercoles: {
        type: DayScheduleSchema,
        default: () => ({ active: true, from: "09:00", to: "17:00" }),
      },
      jueves: {
        type: DayScheduleSchema,
        default: () => ({ active: true, from: "09:00", to: "17:00" }),
      },
      viernes: {
        type: DayScheduleSchema,
        default: () => ({ active: true, from: "09:00", to: "17:00" }),
      },
      sabado: {
        type: DayScheduleSchema,
        default: () => ({ active: false, from: "", to: "" }),
      },
      domingo: {
        type: DayScheduleSchema,
        default: () => ({ active: false, from: "", to: "" }),
      },
    },
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },


googleCalendar: {
  connected: { type: Boolean, default: false },
  calendarId: { type: String, default: "primary" },

  accessToken: { type: String, default: null },
  refreshToken: { type: String, default: null },
  tokenExpiryDate: { type: Date, default: null },

  syncToken: { type: String, default: null },

  watchChannelId: { type: String, default: null },
  watchResourceId: { type: String, default: null },
  watchExpiration: { type: Date, default: null },
},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Especialista", EspecialistaSchema);