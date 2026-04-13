import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UsuarioSchema = new mongoose.Schema(
  {
    nombre:  { type: String, required: true, trim: true },
    email:   { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:{ type: String, required: true, minlength: 6 },
    // ahora con 'client'
    rol: { type: String, enum: ['admin', 'client', 'professional', 'user'], default: 'user' }
  },
  { timestamps: true }
);

UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UsuarioSchema.methods.compararPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('Usuario', UsuarioSchema);
