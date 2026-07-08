import "dotenv/config";
import mongoose from "mongoose";
import Especialista from "../models/EspecialistaModel.js";
import Usuario from "../models/UsuarioModel.js";

const uri = (process.env.URI_DB || process.env.MONGO_URI || "").trim();

if (!uri) {
  console.error("Falta URI_DB o MONGO_URI en .env");
  process.exit(1);
}

async function run() {
  await mongoose.connect(uri);
  console.log("MongoDB conectado");

  const especialistas = await Especialista.find();

  let created = 0;
  let skipped = 0;

  for (const esp of especialistas) {
    const email = esp.contact?.email?.trim().toLowerCase();

    if (!email) {
      console.log(`Sin email: ${esp.name}`);
      skipped++;
      continue;
    }

    const exists = await Usuario.findOne({ email });

    if (exists) {
      console.log(`Ya existe usuario: ${email}`);
      skipped++;
      continue;
    }

    await Usuario.create({
      nombre: esp.name,
      email,
      password: "123456",
      rol: "professional",
      especialistaId: esp._id,
    });

    console.log(`Usuario profesional creado: ${email}`);
    created++;
  }

  console.log("Migración terminada");
  console.log({ created, skipped });

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Error en migración:", err);
  await mongoose.disconnect();
  process.exit(1);
});