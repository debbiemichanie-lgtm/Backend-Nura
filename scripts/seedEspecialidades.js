// scripts/seedEspecialidades.js
import 'dotenv/config.js';
import mongoose from 'mongoose';
import Especialidad from '../models/EspecialidadModel.js';

const uri = (process.env.URI_DB || process.env.MONGO_URI || '').trim();
if (!uri) {
  console.error('❌ Falta URI_DB en .env');
  process.exit(1);
}

const BASE = [
  { nombre: 'Psicóloga',    descripcion: 'Atención psicológica integral' },
  { nombre: 'Psiquiatra',   descripcion: 'Tratamiento farmacológico y psiquiátrico' },
  { nombre: 'Ginecóloga',   descripcion: 'Salud femenina y control hormonal' },
  { nombre: 'Nutricionista',descripcion: 'Alimentación equilibrada y TCA' },
  { nombre: 'Clínico',      descripcion: 'Control general y diagnóstico clínico' },
];

async function run() {
  await mongoose.connect(uri);
  console.log('✅ Conectado');

  // Garantiza que existan 1 sola vez (upsert por nombre)
  for (const item of BASE) {
    await Especialidad.updateOne(
      { nombre: item.nombre },
      { $set: item },
      { upsert: true }
    );
  }

  const total = await Especialidad.countDocuments();
  console.log(`🌱 Seed especialidades OK. Total en colección: ${total}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Seed especialidades error:', e);
  process.exit(1);
});
