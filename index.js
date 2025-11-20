// index.js (raíz)
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import usuarioRouter from './routes/UsuarioRouter.js';
import especialistaRouter from './routes/EspecialistaRouter.js';
import especialidadRouter from './routes/EspecialidadRouter.js';
import authRouter from "./routes/AuthRouter.js";
import errorHandler from './middlewares/errorHandler.js';

// Necesario para resolver __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// JSON bonito en dev
if (process.env.NODE_ENV !== 'production') {
  app.set('json spaces', 2);
}

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());

// Archivos estáticos (FOTOS)
app.use(
  express.static(path.join(__dirname, 'public'), {
    index: false // 👈 NO servir index.html
  })
);

// Healthcheck
app.get('/health', (_req, res) =>
  res.json({ ok: true, status: 'up' })
);

// Rutas API
app.use("/api/auth", authRouter);
app.use("/api/usuarios", usuarioRouter);
app.use("/api/especialistas", especialistaRouter);
app.use("/api/especialidades", especialidadRouter);

// Manejador de errores
app.use(errorHandler);

// DB + server
const uri = (process.env.URI_DB || '').trim();
if (!uri) {
  console.error('❌ Falta URI_DB en .env');
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
