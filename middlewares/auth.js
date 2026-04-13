// API/middlewares/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET  = process.env.JWT_SECRET  || 'cambia-esto';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// Helper: firmar token con campos consistentes
export function signToken({ uid, email, rol = 'client', extra = {} }) {
  const payload = { uid, email, rol, ...extra }; // SIEMPRE 'rol'
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// Login rápido solo para admin .env (compatibilidad con tu flujo actual)
export function adminLogin(req, res) {
  const { email, password } = req.body || {};
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
  }
  // IMPORTANTE: firmar con 'rol' (no 'role')
  const token = signToken({ email, rol: 'admin' });
  res.json({ ok: true, token, user: { email, rol: 'admin' } });
}

// Autenticación: requiere token (user o admin)
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, message: 'Token requerido' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Normalización por compatibilidad: si viene 'role', lo mapeamos a 'rol'
    if (payload.role && !payload.rol) payload.rol = payload.role;

    req.user = payload; // { uid?, email, rol }
    next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Token inválido/expirado' });
  }
}

// Autorización
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({ ok: false, message: "Solo admin autorizado" });
  }
  next();
}

export function requireProfessionalOrAdmin(req, res, next) {
  if (!req.user || !["admin", "professional"].includes(req.user.rol)) {
    return res.status(403).json({ ok: false, message: "Sin permisos" });
  }
  next();
}

