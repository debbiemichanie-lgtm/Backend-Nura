import mongoose from "mongoose";
import dotenv from "dotenv";
import Usuario from "./models/UsuarioModel.js";
import Especialista from "./models/EspecialistaModel.js";

dotenv.config();

const uri = process.env.URI_DB || process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Conectado a Mongo");

    const usuarios = await Usuario.find();
    console.log("\n👤 USUARIOS:");
    console.log(usuarios);

    const userExtra = await Usuario.findOne({ email: "extrashit1@gmail.com" });
console.log("USER EXTRA:", userExtra);

    const especialistas = await Especialista.find();
    console.log("\n🧑‍⚕️ ESPECIALISTAS:");
    console.log(especialistas);

  } catch (err) {
    console.error("❌ ERROR:", err);
  } finally {
    process.exit();
  }
}

run();