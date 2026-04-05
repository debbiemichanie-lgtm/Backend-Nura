import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import indexRouter from './routes/index.js';
import usuarioRouter from './routes/UsuarioRouter.js';
import especialistaRouter from './routes/EspecialistaRouter.js';
import especialidadRouter from './routes/EspecialidadRouter.js';
import errorHandler from './middlewares/errorHandler.js';
import authRouter from './routes/AuthRouter.js';
import googleCalendarRouter from './routes/GoogleCalendarRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.set('json spaces', 2);
}

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) =>
  res.json({
    ok: true,
    status: 'up',
    cors: 'open',
    env: process.env.NODE_ENV || 'dev',
  })
);

app.use('/api/auth', authRouter);
app.use('/api/usuarios', usuarioRouter);
app.use('/api/especialistas', especialistaRouter);
app.use('/api/especialidades', especialidadRouter);
app.use('/api/google', googleCalendarRouter);
app.use('/', indexRouter);

app.use(errorHandler);

const uri = (process.env.URI_DB || process.env.MONGO_URI || '').trim();

if (!uri) {
  console.error('❌ Falta URI_DB en .env');
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`🚀 Server en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  });